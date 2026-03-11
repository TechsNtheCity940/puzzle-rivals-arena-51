import type { UserProfile } from "@/lib/types";

export type MatchMode = "ranked" | "casual" | "royale" | "challenge" | "daily";

export type MatchPlayablePuzzleType =
  | "rotate_pipes"
  | "number_grid"
  | "pattern_match"
  | "word_scramble"
  | "tile_slide"
  | "sudoku_mini";

export interface PuzzleCatalogEntry {
  type: MatchPlayablePuzzleType;
  label: string;
  icon: string;
  description: string;
}

export interface BackendPuzzleSelection {
  puzzleType: MatchPlayablePuzzleType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  practiceSeed: number;
  liveSeed: number;
  selectedAt: string;
  meta: PuzzleCatalogEntry;
}

export interface BackendLobbyReward {
  xp: number;
  coins: number;
  elo: number;
}

export interface BackendLobbyPlayer {
  playerId: string;
  username: string;
  elo: number;
  rank: UserProfile["rank"];
  isBot: boolean;
  ready: boolean;
  joinedAt: string;
  progress: number;
  practiceProgress: number;
  solvedAtMs: number | null;
  pace: number;
  reward?: BackendLobbyReward;
}

export interface BackendLobbyResults {
  completedAt: string;
  standings: Array<{
    playerId: string;
    username: string;
    progress: number;
    solvedAtMs: number | null;
    rank: number;
    reward: BackendLobbyReward;
    isBot: boolean;
  }>;
}

export interface BackendLobby {
  id: string;
  mode: MatchMode;
  status: "filling" | "ready" | "practice" | "live" | "complete";
  maxPlayers: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  players: BackendLobbyPlayer[];
  selection: BackendPuzzleSelection | null;
  practiceStartsAt: string | null;
  practiceEndsAt: string | null;
  liveStartsAt: string | null;
  liveEndsAt: string | null;
  results: BackendLobbyResults | null;
}

export type RotatePipesSubmission = {
  kind: "rotate_pipes";
  rotations: number[];
};

export type NumberGridSubmission = {
  kind: "number_grid";
  values: Array<number | null>;
};

export type PatternMatchSubmission = {
  kind: "pattern_match";
  answers: number[];
};

export type WordScrambleSubmission = {
  kind: "word_scramble";
  selectedIndices: number[];
};

export type TileSlideSubmission = {
  kind: "tile_slide";
  tiles: number[];
};

export type SudokuMiniSubmission = {
  kind: "sudoku_mini";
  values: Array<number | null>;
};

export type PuzzleSubmission =
  | RotatePipesSubmission
  | NumberGridSubmission
  | PatternMatchSubmission
  | WordScrambleSubmission
  | TileSlideSubmission
  | SudokuMiniSubmission;
