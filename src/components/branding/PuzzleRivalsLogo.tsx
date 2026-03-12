import { Clock3, Sparkles } from "lucide-react";

export default function PuzzleRivalsLogo() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/75 p-5 shadow-[0_28px_70px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.28),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.24),_transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
      <div className="relative flex items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-black/30">
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-300 to-sky-400 opacity-80 blur-sm" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white">
            <Clock3 size={28} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-hud text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
            Match Of The Day
          </p>
          <h1 className="mt-2 text-3xl font-black leading-none tracking-tight text-white sm:text-4xl">
            Puzzle Rivals
          </h1>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-hud font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles size={12} />
            Big Brain Moves
          </div>
        </div>
      </div>
    </div>
  );
}
