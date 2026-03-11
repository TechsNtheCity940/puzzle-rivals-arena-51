import { motion } from "framer-motion";
import { CURRENT_SEASON } from "@/lib/seed-data";
import { Lock, Star, Gift } from "lucide-react";

export default function SeasonPage() {
  const season = CURRENT_SEASON;
  const progressPct = Math.round((season.currentTier / season.maxTier) * 100);

  return (
    <div className="space-y-4 px-4 pb-4 pt-6">
      <div>
        <p className="hud-label">Season Progression</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Season {season.seasonNumber}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{season.name}</p>
      </div>

      <section className="panel">
        <div className="flex items-center justify-between">
          <div>
            <p className="hud-label">Battle Pass</p>
            <h2 className="mt-1 text-lg font-black">Tier {season.currentTier}/{season.maxTier}</h2>
          </div>
          <span className="rounded-full bg-primary/12 px-3 py-1.5 font-hud text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {progressPct}%
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-prestige"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        {!season.isPremium && (
          <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-prestige text-xs font-black uppercase tracking-[0.18em] text-white">
            <Star size={14} />
            Unlock Premium Track - $9.99
          </button>
        )}
      </section>

      <div className="space-y-2">
        {season.tracks.map((track) => (
          <div
            key={track.tier}
            className={`surface flex items-center gap-3 p-3 ${track.isUnlocked ? "" : "opacity-50"}`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black ${
              track.isUnlocked ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}>
              {track.tier}
            </div>

            <div className="min-w-0 flex-1">
              {track.freeReward ? (
                <div className="flex items-center gap-1.5">
                  <Gift size={12} className="flex-shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm">{track.freeReward.label}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>

            <div className="min-w-0 flex items-center gap-1.5">
              {!season.isPremium && <Lock size={10} className="flex-shrink-0 text-muted-foreground" />}
              <span className={`truncate text-sm ${season.isPremium ? "text-primary" : "text-muted-foreground"}`}>
                {track.premiumReward?.label || "-"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
