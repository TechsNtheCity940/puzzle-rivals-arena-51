import type { Session } from "@supabase/supabase-js";
import { CURRENT_USER, getRankBand } from "@/lib/seed-data";
import { DEFAULT_AVATAR_ID } from "@/lib/profile-customization";
import { supabase } from "@/lib/supabase-client";
import type {
  LeaderboardEntry,
  PuzzleType,
  StockAvatarId,
  UserProfile,
} from "@/lib/types";

type ProfileRow = {
  id: string;
  username: string;
  avatar_id: StockAvatarId | null;
  rank: UserProfile["rank"];
  elo: number;
  level: number;
  xp: number;
  xp_to_next: number;
  coins: number;
  gems: number;
  is_vip: boolean;
  best_puzzle_type: string | null;
  worst_puzzle_type: string | null;
  rival_user_id: string | null;
  facebook_handle: string | null;
  tiktok_handle: string | null;
  created_at: string;
};

type PlayerStatsRow = {
  wins: number;
  losses: number;
  matches_played: number;
  win_streak: number;
  best_streak: number;
};

type PuzzleStatsRow = {
  puzzle_type: PuzzleType;
  matches_played: number;
  wins: number;
  total_progress: number;
};

type SocialDirectoryEntry = {
  id: string;
  username: string;
  avatar_id: StockAvatarId | null;
  rank: UserProfile["rank"];
  elo: number;
  facebook_handle: string | null;
  tiktok_handle: string | null;
};

function emptyPuzzleSkills() {
  return { ...CURRENT_USER.puzzleSkills };
}

export function buildGuestUser(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    ...CURRENT_USER,
    id: "guest-player",
    username: overrides.username ?? "Guest Player",
    avatarId: overrides.avatarId ?? DEFAULT_AVATAR_ID,
    socialLinks: {
      ...CURRENT_USER.socialLinks,
      ...overrides.socialLinks,
    },
    puzzleSkills: {
      ...emptyPuzzleSkills(),
      ...overrides.puzzleSkills,
    },
    isGuest: true,
    authMethod: "guest",
    email: null,
    worstPuzzleType: null,
    ...overrides,
  };
}

function computePuzzleSnapshot(rows: PuzzleStatsRow[]) {
  const puzzleSkills = emptyPuzzleSkills();
  let worstPuzzleType: PuzzleType | null = null;
  let worstScore = Number.POSITIVE_INFINITY;

  for (const row of rows) {
    if (!row.matches_played) continue;
    const averageProgress = Math.round(row.total_progress / row.matches_played);
    puzzleSkills[row.puzzle_type] = averageProgress;
    if (averageProgress < worstScore) {
      worstScore = averageProgress;
      worstPuzzleType = row.puzzle_type;
    }
  }

  return {
    puzzleSkills,
    worstPuzzleType,
  };
}

export async function loadCurrentUserFromSession(session: Session | null): Promise<UserProfile | null> {
  if (!supabase || !session?.user) {
    return null;
  }

  const [{ data: profile }, { data: stats }, { data: puzzleStats }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", session.user.id).single<ProfileRow>(),
    supabase.from("player_stats").select("*").eq("user_id", session.user.id).single<PlayerStatsRow>(),
    supabase.from("player_puzzle_stats").select("puzzle_type, matches_played, wins, total_progress").eq("user_id", session.user.id),
  ]);

  if (!profile) {
    return null;
  }

  const computed = computePuzzleSnapshot((puzzleStats ?? []) as PuzzleStatsRow[]);
  const provider = session.user.app_metadata?.provider === "facebook" ? "facebook" : "email";

  return {
    ...CURRENT_USER,
    id: profile.id,
    username: profile.username,
    email: session.user.email ?? null,
    avatarId: profile.avatar_id ?? DEFAULT_AVATAR_ID,
    elo: profile.elo,
    rank: getRankBand(profile.elo).tier,
    level: profile.level,
    xp: profile.xp,
    xpToNext: profile.xp_to_next,
    coins: profile.coins,
    gems: profile.gems,
    isVip: profile.is_vip,
    wins: stats?.wins ?? 0,
    losses: stats?.losses ?? 0,
    matchesPlayed: stats?.matches_played ?? 0,
    winStreak: stats?.win_streak ?? 0,
    bestStreak: stats?.best_streak ?? 0,
    joinedAt: profile.created_at,
    isGuest: false,
    authMethod: provider,
    worstPuzzleType: (profile.worst_puzzle_type as PuzzleType | null) ?? computed.worstPuzzleType,
    socialLinks: {
      facebook: profile.facebook_handle ?? undefined,
      tiktok: profile.tiktok_handle ?? undefined,
    },
    puzzleSkills: computed.puzzleSkills,
  };
}

export async function saveProfileToSupabase(user: UserProfile) {
  if (!supabase || user.isGuest) {
    return;
  }

  const { error } = await supabase.from("profiles").update({
    username: user.username,
    avatar_id: user.avatarId ?? DEFAULT_AVATAR_ID,
    facebook_handle: user.socialLinks.facebook?.trim() || null,
    tiktok_handle: user.socialLinks.tiktok?.trim() || null,
  }).eq("id", user.id);

  if (error) {
    throw error;
  }
}

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  if (!supabase) {
    return [];
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return [];
  }

  const { data } = await supabase
    .from("player_stats")
    .select("user_id, wins, matches_played, profiles!inner(id, username, rank, elo, avatar_id)")
    .gt("matches_played", 0)
    .limit(Math.max(limit, 10));

  return (data ?? [])
    .map((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      if (!profile) return null;
      return {
        userId: profile.id,
        username: profile.username,
        avatarId: profile.avatar_id ?? undefined,
        avatarUrl: profile.avatar_id ?? undefined,
        elo: profile.elo,
        rankTier: profile.rank,
        wins: row.wins,
        rank: 0,
      } satisfies LeaderboardEntry;
    })
    .filter((entry): entry is LeaderboardEntry => Boolean(entry))
    .sort((left, right) => right.elo - left.elo)
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

export async function fetchSocialDirectory(currentUserId?: string): Promise<SocialDirectoryEntry[]> {
  if (!supabase) {
    return [];
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return [];
  }

  let query = supabase
    .from("profiles")
    .select("id, username, avatar_id, rank, elo, facebook_handle, tiktok_handle");

  if (currentUserId) {
    query = query.neq("id", currentUserId);
  }

  const { data } = await query.order("elo", { ascending: false });
  return (data ?? []) as SocialDirectoryEntry[];
}
