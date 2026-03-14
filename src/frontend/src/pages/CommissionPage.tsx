import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, IndianRupee } from "lucide-react";
import { useEffect } from "react";
import { DepositStatus } from "../backend";
import PageHeader from "../components/PageHeader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCommissionBalance, useDeposits } from "../hooks/useQueries";

function formatDate(ns: bigint) {
  return new Date(Number(ns) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CommissionPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: commission, isLoading: commissionLoading } =
    useCommissionBalance();
  const { data: deposits, isLoading: depositsLoading } = useDeposits();

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  if (!identity) return null;

  const approvedDeposits =
    deposits?.filter((d) => d.status === DepositStatus.approved) || [];

  return (
    <div className="min-h-dvh pb-24">
      <PageHeader title="Commission" />

      <div className="px-4 space-y-4">
        {/* Total Commission Card */}
        <div className="glass-card rounded-2xl p-6 border-l-4 border-l-yellow-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee size={16} className="text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Total Commission Earned
            </p>
          </div>
          {commissionLoading ? (
            <Skeleton className="h-10 w-40 mt-2 bg-white/10" />
          ) : (
            <p className="font-display text-5xl font-bold text-yellow-400">
              ₹{(commission ?? 0).toFixed(2)}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Lifetime earnings from approved deposits
          </p>
        </div>

        {/* Approved Deposits */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Approved Deposits ({approvedDeposits.length})
          </p>

          {depositsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-16 w-full rounded-xl bg-white/5"
                />
              ))}
            </div>
          ) : approvedDeposits.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <CheckCircle
                size={40}
                className="text-muted-foreground mx-auto mb-3"
              />
              <p className="text-muted-foreground text-sm">
                No approved deposits yet.
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Submit deposits to earn commission.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {approvedDeposits.map((d, i) => (
                <div
                  key={String(d.id)}
                  className="glass-card rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">Deposit #{i + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(d.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400">
                      ₹{d.amount.toFixed(2)}
                    </p>
                    <span className="text-xs bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full">
                      Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
