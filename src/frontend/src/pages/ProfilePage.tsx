import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Camera,
  Check,
  ChevronLeft,
  Edit2,
  Fingerprint,
  Loader2,
  LogOut,
  Phone,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeposits,
  useSaveProfile,
  useTransactionHistory,
  useUserProfile,
} from "../hooks/useQueries";

function truncatePrincipal(principal: string) {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}...${principal.slice(-4)}`;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile();
  const { data: deposits = [] } = useDeposits();
  const { data: transactions = [] } = useTransactionHistory();
  const saveProfile = useSaveProfile();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  const displayName = profile?.name || "Agent";
  const principalStr = identity?.getPrincipal().toString() || "";

  // Stats computation
  const runningCount = deposits.filter(
    (d) => String(d.status) === "approved",
  ).length;
  const depositPendingCount = deposits.filter(
    (d) => String(d.status) === "pending",
  ).length;
  const pendingWithdrawals = transactions.filter((tx) => {
    if ("withdrawalRequest" in tx.transactionType) {
      return String(tx.transactionType.withdrawalRequest.status) === "pending";
    }
    return false;
  }).length;
  const rejectedCount =
    deposits.filter((d) => String(d.status) === "rejected").length +
    transactions.filter((tx) => {
      if ("withdrawalRequest" in tx.transactionType) {
        return (
          String(tx.transactionType.withdrawalRequest.status) === "rejected"
        );
      }
      return false;
    }).length;

  const handleStartEdit = () => {
    setEditName(profile?.name || "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await saveProfile.mutateAsync({ ...profile, name: editName.trim() });
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/login" });
  };

  if (!identity) return null;

  return (
    <div className="min-h-dvh pb-28 bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <button
          type="button"
          data-ocid="profile.back_button"
          onClick={() => navigate({ to: "/" })}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>

        <h1 className="font-display text-lg font-bold tracking-wide">
          My Profile
        </h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={20} className="text-foreground/70" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
          </div>
          <div className="text-right">
            {isLoading ? (
              <Skeleton className="h-3.5 w-20 mb-1 bg-white/10" />
            ) : (
              <p className="text-xs font-semibold leading-tight">
                {displayName}
              </p>
            )}
            {isLoading ? (
              <Skeleton className="h-3 w-16 bg-white/10" />
            ) : (
              <p className="text-xs text-muted-foreground leading-tight">
                {profile?.phone || ""}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-4">
          {/* Avatar with yellow ring */}
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full ring-4 ring-yellow-400/80 ring-offset-2 ring-offset-background flex items-center justify-center bg-white/10">
              <User size={44} className="text-foreground/50" />
            </div>
            {/* Camera button */}
            <button
              type="button"
              data-ocid="profile.upload_button"
              onClick={() => toast("Coming soon")}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg border-2 border-background"
            >
              <Camera size={14} className="text-black" />
            </button>
          </div>

          {/* Name with edit */}
          {isLoading ? (
            <Skeleton className="h-6 w-32 bg-white/10" />
          ) : editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-foreground text-sm font-semibold focus:outline-none focus:border-yellow-400/50 text-center"
                // biome-ignore lint/a11y/noAutofocus: intentional UX focus
                autoFocus
              />
              <button
                type="button"
                data-ocid="profile.save_button"
                onClick={handleSave}
                disabled={saveProfile.isPending}
                className="w-7 h-7 rounded-full bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center"
              >
                {saveProfile.isPending ? (
                  <Loader2 size={12} className="animate-spin text-green-400" />
                ) : (
                  <Check size={12} className="text-green-400" />
                )}
              </button>
              <button
                type="button"
                data-ocid="profile.cancel_button"
                onClick={() => setEditing(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X size={12} className="text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold">{displayName}</h2>
              <button
                type="button"
                data-ocid="profile.edit_button"
                onClick={handleStartEdit}
                className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Edit2 size={11} className="text-yellow-400" />
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3" data-ocid="profile.section">
          {/* Running */}
          <div className="glass-card rounded-2xl p-4 flex flex-col">
            <span className="text-3xl font-display font-bold text-green-400">
              {runningCount}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Running</span>
          </div>
          {/* Deposit Pending */}
          <div className="glass-card rounded-2xl p-4 flex flex-col">
            <span className="text-3xl font-display font-bold text-cyan-400">
              {depositPendingCount}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Deposit Pending
            </span>
          </div>
          {/* Pending */}
          <div className="glass-card rounded-2xl p-4 flex flex-col">
            <span className="text-3xl font-display font-bold text-yellow-400">
              {pendingWithdrawals}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Pending</span>
          </div>
          {/* Rejected */}
          <div className="glass-card rounded-2xl p-4 flex flex-col">
            <span className="text-3xl font-display font-bold text-pink-400">
              {rejectedCount}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Rejected</span>
          </div>
        </div>

        {/* Account Details */}
        <div
          className="glass-card rounded-2xl overflow-hidden"
          data-ocid="profile.card"
        >
          {/* Card Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <div className="w-7 h-7 rounded-lg bg-yellow-400/10 flex items-center justify-center">
              <Fingerprint size={15} className="text-yellow-400" />
            </div>
            <span className="text-sm font-semibold">Account Details</span>
          </div>

          {/* User ID Row */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center shrink-0">
              <Fingerprint size={15} className="text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="text-xs font-mono text-foreground/80 truncate">
                {truncatePrincipal(principalStr)}
              </p>
            </div>
            <span className="text-xs font-mono text-foreground/50 shrink-0">
              {principalStr ? truncatePrincipal(principalStr) : "—"}
            </span>
          </div>

          <div className="h-px bg-white/5 mx-4" />

          {/* Phone Row */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center shrink-0">
              <Phone size={15} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Phone Number</p>
            </div>
            <span className="text-sm font-medium text-foreground/80">
              {isLoading ? (
                <Skeleton className="h-4 w-24 bg-white/10" />
              ) : (
                profile?.phone || "—"
              )}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          data-ocid="profile.delete_button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold py-3.5 rounded-xl transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>

        <p className="text-center text-xs text-muted-foreground pb-2">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
