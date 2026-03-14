import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Bell,
  Building2,
  Clock,
  Headphones,
  IndianRupee,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCommissionBalance, useUserProfile } from "../hooks/useQueries";

const quickActions = [
  {
    label: "Deposit",
    icon: ArrowDownCircle,
    path: "/deposit",
    ocid: "dashboard.deposit_button",
    color: "text-emerald-400",
  },
  {
    label: "Withdraw",
    icon: ArrowUpCircle,
    path: "/withdraw",
    ocid: "dashboard.withdraw_button",
    color: "text-rose-400",
  },
  {
    label: "Add Bank",
    icon: Building2,
    path: "/add-bank",
    ocid: "dashboard.addbank_button",
    color: "text-blue-400",
  },
  {
    label: "Commission",
    icon: IndianRupee,
    path: "/commission",
    ocid: "dashboard.commission_button",
    color: "text-yellow-400",
  },
  {
    label: "History",
    icon: Clock,
    path: "/history",
    ocid: "dashboard.history_button",
    color: "text-purple-400",
  },
  {
    label: "Support",
    icon: Headphones,
    path: "/support",
    ocid: "dashboard.support_button",
    color: "text-cyan-400",
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: commission, isLoading: commissionLoading } =
    useCommissionBalance();

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  if (!identity) return null;

  const displayName = profile?.name || "Agent";
  const displayPhone = profile?.phone || "";

  return (
    <div className="min-h-dvh pb-24">
      {/* Header */}
      <header className="px-4 pt-10 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shadow-glow-sm">
            <Zap size={20} className="text-black" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display font-bold text-base text-foreground leading-tight">
              AgentPay
            </p>
            {profileLoading ? (
              <Skeleton className="h-3 w-24 mt-0.5 bg-white/10" />
            ) : (
              <p className="text-xs text-muted-foreground leading-tight">
                {displayPhone}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="relative w-9 h-9 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Bell size={18} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400" />
        </button>
      </header>

      <div className="px-4 space-y-4">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h2 className="font-display text-2xl font-bold">Welcome, Agent 👋</h2>
          {profileLoading ? (
            <Skeleton className="h-4 w-32 mt-1 bg-white/10" />
          ) : (
            <p className="text-muted-foreground text-sm mt-0.5">
              {displayName}
            </p>
          )}
        </motion.div>

        {/* Commission Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="glass-card rounded-2xl p-5 border-l-4 border-l-yellow-400 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none" />
          <p className="text-muted-foreground text-sm font-medium">
            Live Commission
          </p>
          {commissionLoading ? (
            <Skeleton className="h-9 w-36 mt-2 bg-white/10" />
          ) : (
            <p className="font-display text-4xl font-bold text-yellow-400 mt-1">
              ₹{(commission ?? 0).toFixed(2)}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1 opacity-60">
            Updated just now
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
        >
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Quick Actions
          </p>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map(({ label, icon: Icon, path, ocid, color }, i) => (
              <motion.button
                key={path}
                type="button"
                data-ocid={ocid}
                onClick={() => navigate({ to: path })}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: 0.2 + i * 0.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2.5 hover:bg-white/8 transition-all duration-200 active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Icon size={22} className={color} strokeWidth={1.8} />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
