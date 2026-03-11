import { NavLink, useLocation } from "react-router-dom";
import { Home, Swords, Trophy, ShoppingBag, Star, User } from "lucide-react";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/play", icon: Swords, label: "Play" },
  { to: "/tournaments", icon: Trophy, label: "Tourneys" },
  { to: "/store", icon: ShoppingBag, label: "Store" },
  { to: "/season", icon: Star, label: "Season" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();

  // Hide nav during active match
  if (location.pathname.startsWith("/match")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`tab-item ${isActive ? "active" : ""}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="font-condensed text-[10px] font-semibold uppercase tracking-wider">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
