import { useLocation, useNavigate } from "@tanstack/react-router";
import { Clock, CreditCard, House, User } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: House, ocid: "nav.home_link" },
  {
    path: "/accounts",
    label: "Accounts",
    icon: CreditCard,
    ocid: "nav.accounts_link",
  },
  { path: "/history", label: "History", icon: Clock, ocid: "nav.history_link" },
  { path: "/profile", label: "Profile", icon: User, ocid: "nav.profile_link" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div className="glass-card border-t border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-3 safe-bottom">
          {navItems.map(({ path, label, icon: Icon, ocid }) => {
            const isActive =
              path === "/" ? pathname === "/" : pathname.startsWith(path);
            return (
              <button
                key={path}
                type="button"
                data-ocid={ocid}
                onClick={() => navigate({ to: path })}
                className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200"
              >
                <Icon
                  size={22}
                  className={
                    isActive ? "text-yellow-400" : "text-muted-foreground"
                  }
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={`text-[10px] font-medium tracking-wide ${
                    isActive ? "text-yellow-400" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
