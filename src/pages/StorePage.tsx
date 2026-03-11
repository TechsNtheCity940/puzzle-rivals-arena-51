import { useState } from "react";
import { STORE_ITEMS, VIP_MEMBERSHIP, romanNumeral } from "@/lib/seed-data";
import { ShoppingBag, Crown, Check, ExternalLink } from "lucide-react";
import type { ItemCategory } from "@/lib/types";

type Tab = "all" | ItemCategory;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "theme", label: "Themes" },
  { id: "frame", label: "Frames" },
  { id: "avatar", label: "Avatars" },
  { id: "bundle", label: "Bundles" },
  { id: "hint_pack", label: "Hints" },
];

export default function StorePage() {
  const [tab, setTab] = useState<Tab>("all");
  const items = tab === "all" ? STORE_ITEMS : STORE_ITEMS.filter((i) => i.category === tab);
  const vip = VIP_MEMBERSHIP;

  return (
    <div className="space-y-4 px-4 pb-4 pt-6">
      <div>
        <p className="hud-label">Customization Market</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Store</h1>
      </div>

      <section className="panel relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-prestige opacity-90" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <Crown size={24} className="text-white" />
            <div className="flex-1">
              <p className="text-sm font-black text-white">VIP Membership</p>
              <p className="text-[11px] font-hud uppercase tracking-[0.16em] text-white/75">${vip.priceUsd}/month</p>
            </div>
            <button className="rounded-2xl bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-background">
              Subscribe
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {vip.perks.slice(0, 4).map((perk) => (
              <div key={perk} className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-white">
                <Check size={12} className="flex-shrink-0" />
                <span className="text-[11px] font-hud leading-snug">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 rounded-full px-4 py-2 font-hud text-xs font-semibold uppercase tracking-[0.18em] transition-all ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className={`surface overflow-hidden ${item.isFeatured ? "border-primary/30" : ""}`}>
            <div className="relative flex h-32 items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))]">
              <ShoppingBag size={34} className="text-muted-foreground/30" />
              {item.isFeatured && (
                <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-1 font-hud text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground">
                  Featured
                </span>
              )}
              <span className="absolute right-3 top-3 text-[10px] font-hud font-semibold text-muted-foreground">
                {romanNumeral(item.rarity)}
              </span>
              {item.isOwned && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <Check size={24} className="text-primary" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-black leading-tight">{item.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
              <div className="mt-3">
                {item.isOwned ? (
                  <span className="font-hud text-xs font-semibold uppercase tracking-[0.16em] text-primary">Owned</span>
                ) : item.priceUsd ? (
                  <button className="flex h-9 w-full items-center justify-center gap-1 rounded-2xl bg-gradient-play text-[11px] font-black uppercase tracking-[0.14em] text-primary-foreground">
                    <ExternalLink size={10} />
                    ${item.priceUsd}
                  </button>
                ) : item.priceGems ? (
                  <button className="h-9 w-full rounded-2xl bg-card font-hud text-xs font-semibold uppercase tracking-[0.14em]">
                    💎 {item.priceGems}
                  </button>
                ) : (
                  <button className="h-9 w-full rounded-2xl bg-card font-hud text-xs font-semibold uppercase tracking-[0.14em]">
                    🪙 {item.priceCoins?.toLocaleString()}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
