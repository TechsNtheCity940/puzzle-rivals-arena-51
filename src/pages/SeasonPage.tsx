import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { CURRENT_SEASON } from "@/lib/seed-data";
import { capturePayPalCheckout, createPayPalCheckout, fetchStorefront } from "@/lib/storefront";
import { useAuth } from "@/providers/AuthProvider";

const TIER_XP = 500;
const BATTLE_PASS_PRODUCT_ID = "s_6";

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

export default function SeasonPage() {
  const [hasSeasonPass, setHasSeasonPass] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [params, setParams] = useSearchParams();
  const { user, canSave, refreshUser } = useAuth();

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const snapshot = await fetchStorefront(user);
        if (active) {
          setHasSeasonPass(Boolean(snapshot.wallet?.hasSeasonPass));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load season pass.";
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
      toast.message("Battle pass checkout cancelled.");
      clearCheckoutParams(params, setParams);
      return;
    }

    if (checkoutState !== "paypal" || !purchaseId) {
      return;
    }

    let active = true;

    async function capture() {
      setIsPurchasing(true);
      try {
        await capturePayPalCheckout(purchaseId);
        await refreshUser();
        const snapshot = await fetchStorefront(user);
        if (active) {
          setHasSeasonPass(Boolean(snapshot.wallet?.hasSeasonPass));
        }
        toast.success("Battle pass unlocked.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to capture battle pass purchase.";
        toast.error(message);
      } finally {
        if (active) {
          setIsPurchasing(false);
          clearCheckoutParams(params, setParams);
        }
      }
    }

    void capture();
    return () => {
      active = false;
    };
  }, [params, refreshUser, setParams, user]);

  const currentTier = useMemo(() => {
    const xp = user?.xp ?? 0;
    return Math.max(1, Math.min(CURRENT_SEASON.maxTier, Math.floor(xp / TIER_XP) + 1));
  }, [user?.xp]);

  const progressWithinTier = useMemo(() => {
    const xp = user?.xp ?? 0;
    return Math.round(((xp % TIER_XP) / TIER_XP) * 100);
  }, [user?.xp]);

  const tracks = useMemo(
    () =>
      CURRENT_SEASON.tracks.map((track) => ({
        ...track,
        isUnlocked: track.tier <= currentTier,
      })),
    [currentTier],
  );

  async function unlockPremiumTrack() {
    if (!canSave) {
      toast.error("Sign in with email or Facebook before buying the battle pass.");
      return;
    }

    setIsPurchasing(true);
    try {
      const response = await createPayPalCheckout(BATTLE_PASS_PRODUCT_ID, "/season");
      window.location.assign(response.approvalUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start checkout.";
      toast.error(message);
      setIsPurchasing(false);
    }
  }

  return (
    <div className="space-y-4 px-4 pb-4 pt-6">
      <div>
        <p className="hud-label">Season Progression</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Season {CURRENT_SEASON.seasonNumber}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{CURRENT_SEASON.name}</p>
      </div>

      {!canSave && (
        <section className="panel border-primary/20 bg-primary/5">
          <p className="text-sm font-semibold text-primary">
            Guest accounts can view season rewards, but premium unlocks only attach to signed-in accounts.
          </p>
        </section>
      )}

      <section className="panel">
        <div className="flex items-center justify-between">
          <div>
            <p className="hud-label">Battle Pass</p>
            <h2 className="mt-1 text-lg font-black">Tier {currentTier}/{CURRENT_SEASON.maxTier}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {progressWithinTier}% toward the next tier
            </p>
          </div>
          <span className="rounded-full bg-primary/12 px-3 py-1.5 font-hud text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {hasSeasonPass ? "Premium" : "Free Track"}
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-prestige"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(progressWithinTier, 6)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {!hasSeasonPass ? (
          <Button
            variant="prestige"
            size="lg"
            className="mt-4 w-full rounded-2xl"
            disabled={isLoading || isPurchasing}
            onClick={() => void unlockPremiumTrack()}
          >
            <Star size={14} />
            {isPurchasing ? "Opening checkout..." : "Unlock Premium Track - $9.99"}
          </Button>
        ) : (
          <div className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
            Premium track unlocked. Future reward claims now follow your live season progression.
          </div>
        )}
      </section>

      <div className="space-y-2">
        {tracks.map((track) => (
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
              {!hasSeasonPass && <Lock size={10} className="flex-shrink-0 text-muted-foreground" />}
              <span className={`truncate text-sm ${hasSeasonPass ? "text-primary" : "text-muted-foreground"}`}>
                {track.premiumReward?.label || "-"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
