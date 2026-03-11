import { useState } from "react";
import { Trophy, Users, Zap, Radar } from "lucide-react";
import { TOURNAMENTS, PUZZLE_TYPES } from "@/lib/seed-data";

type Tab = "upcoming" | "live" | "completed";

export default function TournamentsPage() {
  const [tab, setTab] = useState<Tab>("live");

  const filtered = TOURNAMENTS.filter((t) => t.status === tab);
  const tabs: { id: Tab; label: string }[] = [
    { id: "live", label: "Live" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
  ];
  const liveTournament = TOURNAMENTS.find((t) => t.status === "live");

  return (
    <div className="space-y-4 px-4 pb-4 pt-6">
      <div>
        <p className="hud-label">Competitive Events</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Tournaments</h1>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-full px-4 py-2.5 font-hud text-xs font-semibold uppercase tracking-[0.18em] transition-all ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {liveTournament && (
        <section className="panel relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(191,255,0,0.18),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent)]" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12">
              <Trophy size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="hud-label text-primary">Featured Event</p>
              <p className="mt-1 text-lg font-black">{liveTournament.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">Live bracket, elimination rounds, rapid entry lock.</p>
            </div>
            <div className="rounded-2xl bg-primary/12 px-3 py-2 text-center">
              <p className="font-hud text-[10px] uppercase tracking-[0.18em] text-primary">Live</p>
              <p className="text-sm font-black">{liveTournament.currentPlayers}</p>
            </div>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-background/35 p-3">
              <p className="hud-label">Prize</p>
              <p className="mt-1 text-sm font-black">🪙 {liveTournament.prizePool.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-background/35 p-3">
              <p className="hud-label">Entry</p>
              <p className="mt-1 text-sm font-black">{liveTournament.entryFee || "Free"}</p>
            </div>
            <div className="rounded-2xl bg-background/35 p-3">
              <p className="hud-label">Status</p>
              <p className="mt-1 text-sm font-black">Active</p>
            </div>
          </div>
        </section>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="panel text-center text-sm text-muted-foreground">No {tab} tournaments</p>
        )}
        {filtered.map((t) => {
          const puzzle = PUZZLE_TYPES.find((p) => p.type === t.puzzleType);
          return (
            <button key={t.id} className="panel-interactive w-full text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background/40 text-2xl">
                  {puzzle?.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black">{t.name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] font-hud text-muted-foreground">
                      <Users size={10} />
                      {t.currentPlayers}/{t.maxPlayers}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-hud text-muted-foreground">
                      <Zap size={10} />
                      {t.entryFee > 0 ? `${t.entryFee} coins` : "Free"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-hud text-muted-foreground">
                      <Radar size={10} />
                      {t.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">🪙 {t.prizePool.toLocaleString()}</p>
                  {t.status === "upcoming" && (
                    <p className="mt-1 text-[11px] font-hud text-muted-foreground">
                      {new Date(t.startsAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
