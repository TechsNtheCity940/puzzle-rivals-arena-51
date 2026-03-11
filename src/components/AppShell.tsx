import { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(156,52,255,0.22),_transparent_55%)]" />
        <div className="absolute right-[-20%] top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-[-15%] h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>
      <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
