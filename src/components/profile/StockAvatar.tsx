import { Disc3, Blocks, Grid2x2, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStockAvatar } from "@/lib/profile-customization";
import type { StockAvatarId } from "@/lib/types";

function AccessoryIcon({ avatarId }: { avatarId: StockAvatarId }) {
  if (avatarId === "blue-spinner") return <Disc3 size={18} />;
  if (avatarId === "orange-cube") return <Blocks size={18} />;
  if (avatarId === "violet-popper") return <Grid2x2 size={18} />;
  return <Box size={18} />;
}

type StockAvatarProps = {
  avatarId?: StockAvatarId | null;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  className?: string;
};

export default function StockAvatar({
  avatarId,
  size = "md",
  selected = false,
  className,
}: StockAvatarProps) {
  const avatar = getStockAvatar(avatarId);
  const sizeClassName = size === "sm" ? "h-12 w-12" : size === "lg" ? "h-24 w-24" : "h-20 w-20";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[26px] border border-white/10 bg-slate-950",
        sizeClassName,
        avatar.glowClassName,
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", avatar.accentFrom, avatar.accentTo)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_42%)]" />
      <div className="absolute left-1/2 top-2 h-[72%] w-[78%] -translate-x-1/2 rounded-[999px] bg-black/30 blur-sm" />
      <div className="absolute left-1/2 top-[16%] h-[62%] w-[68%] -translate-x-1/2 rounded-t-[60%] rounded-b-[36%] bg-slate-950/90" />
      <div className="absolute left-1/2 top-[24%] h-[30%] w-[44%] -translate-x-1/2 rounded-[42%] bg-slate-950">
        <span className="absolute left-[18%] top-[28%] h-2 w-3 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
        <span className="absolute right-[18%] top-[28%] h-2 w-3 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
      </div>
      <div className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-2xl bg-black/45 text-white backdrop-blur-sm">
        <AccessoryIcon avatarId={avatar.id} />
      </div>
    </div>
  );
}
