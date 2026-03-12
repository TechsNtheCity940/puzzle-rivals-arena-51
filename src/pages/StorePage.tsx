import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Crown, ExternalLink, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/providers/AuthProvider";
import { VIP_MEMBERSHIP, romanNumeral } from "@/lib/seed-data";
import {
  capturePayPalCheckout,
  createPayPalCheckout,
  fetchStorefront,
  purchaseStoreItem,
  type StorefrontItem,
  type StorefrontSnapshot,
} from "@/lib/storefront";
import type { ItemCategory } from "@/lib/types";

type Tab = "all" | ItemCategory;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "theme", label: "Themes" },
  { id: "frame", label: "Frames" },
  { id: "avatar", label: "Avatars" },
  { id: "bundle", label: "Bundles" },
  { id: "hint_pack", label: "Hints" },
  { id: "battle_pass", label: "Pass" },
];

function formatPrice(item: StorefrontItem) {
  if (item.priceUsd) return `$${item.priceUsd.toFixed(2)}`;
  if (item.priceGems) return `${item.priceGems} Gems`;
  if (item.priceCoins) return `${item.priceCoins.toLocaleString()} Coins`;
  return "Unavailable";
}

function clearCheckoutParams(
  params: URLSearchParams,
  setParams: ReturnType<typeof useSearchParams>[1],
) {
  const next = new URLSearchParams(params);
  next.delete("checkout");
  next.delete("purchase");
  next.delete("product");
  setParams(next, { replace: true });
}

export default function StorePage() {
  const [tab, setTab] = useState<Tab>("all");
  const [snapshot, setSnapshot] = useState<StorefrontSnapshot>({ items: [], vipProduct: null, wallet: null });
  const [isLoading, setIsLoading] = useState(true);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const { user, canSave, refreshUser } = useAuth();

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const next = await fetchStorefront(user);
        if (active) {
          setSnapshot(next);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load store.";
        toast.error(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    const checkoutState = params.get("checkout");
    const purchaseId = params.get("purchase");

    if (checkoutState === "cancelled") {
      toast.message("PayPal checkout cancelled.");
      clearCheckoutParams(params, setParams);
      return;
    }

    if (checkoutState !== "paypal" || !purchaseId) {
      return;
    }

    let active = true;

    async function capture() {
      setBusyProductId(params.get("product") ?? "paypal");
      try {
        await capturePayPalCheckout(purchaseId);
        await refreshUser();
        const next = await fetchStorefront(user);
        if (active) {
          setSnapshot(next);
        }
        toast.success("Purchase completed.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to capture PayPal order.";
        toast.error(message);
      } finally {
        if (active) {
          setBusyProductId(null);
          clearCheckoutParams(params, setParams);
        }
      }
    }

    void capture();
    return () => {
      active = false;
    };
  }, [params, refreshUser, setParams, user]);

  const items = useMemo(
    () => (tab === "all" ? snapshot.items : snapshot.items.filter((item) => item.category === tab)),
    [snapshot.items, tab],
  );

  async function handlePurchase(item: StorefrontItem) {
    if (!canSave) {
      toast.error("Sign in with email or Facebook before making purchases.");
      return;
    }

    setBusyProductId(item.id);
    try {
      if (item.priceUsd) {
        const response = await createPayPalCheckout(item.id, "/store");
        window.location.assign(response.approvalUrl);
        return;
      }

      await purchaseStoreItem(item.id);
      await refreshUser();
      setSnapshot(await fetchStorefront(user));
      toast.success(`${item.name} added to your account.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Purchase failed.";
      toast.error(message);
    } finally {
      setBusyProductId(null);
    }
  }

  const vip = snapshot.vipProduct;
  const vipButtonLabel = snapshot.wallet?.isVip ? "Extend VIP" : "Subscribe";

  return (
    <div className="space-y-4 px-4 pb-4 pt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="hud-label">Customization Market</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Store</h1>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 px-4 py-3 text-right">
          <p className="font-hud text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Wallet</p>
          <p className="text-sm font-black">{snapshot.wallet?.coins?.toLocaleString() ?? 0} Coins</p>
          <p className="text-sm font-black text-primary">{snapshot.wallet?.gems ?? 0} Gems</p>
          <p className="text-[11px] text-muted-foreground">{snapshot.wallet?.hintBalance ?? 0} hints banked</p>
        </div>
      </div>

      {!canSave && (
        <section className="panel border-primary/20 bg-primary/5">
          <p className="text-sm font-semibold text-primary">Guest mode can browse the store, but purchases only save on signed-in accounts.</p>
        </section>
      )}

      <section className="panel relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-prestige opacity-90" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <Crown size={24} className="text-white" />
            <div className="flex-1">
              <p className="text-sm font-black text-white">{vip?.name ?? "VIP Membership"}</p>
              <p className="text-[11px] font-hud uppercase tracking-[0.16em] text-white/75">
                {vip ? formatPrice(vip) : `$${VIP_MEMBERSHIP.priceUsd.toFixed(2)}/month`}
              </p>
              {snapshot.wallet?.vipExpiresAt && (
                <p className="mt-1 text-[11px] text-white/75">
                  Active until {new Date(snapshot.wallet.vipExpiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button
              variant="secondary"
              className="rounded-2xl bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-background hover:bg-white/90"
              disabled={!vip || busyProductId === vip.id}
              onClick={() => vip && handlePurchase(vip)}
            >
              {busyProductId === vip?.id ? "Working..." : vipButtonLabel}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {VIP_MEMBERSHIP.perks.slice(0, 4).map((perk) => (
              <div key={perk} className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-white">
                <Check size={12} className="flex-shrink-0" />
                <span className="text-[11px] font-hud leading-snug">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            onClick={() => setTab(entry.id)}
            className={`flex-shrink-0 rounded-full px-4 py-2 font-hud text-xs font-semibold uppercase tracking-[0.18em] transition-all ${
              tab === entry.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {entry.label}
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
                ) : (
                  <Button
                    className="h-9 w-full rounded-2xl text-[11px] font-black uppercase tracking-[0.14em]"
                    variant={item.priceUsd ? "play" : "outline"}
                    disabled={isLoading || busyProductId === item.id}
                    onClick={() => void handlePurchase(item)}
                  >
                    {busyProductId === item.id ? "Working..." : item.priceUsd ? <ExternalLink size={10} /> : null}
                    {busyProductId === item.id ? "" : formatPrice(item)}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
