import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { ArrowDownCircle, ArrowUpCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { Transaction } from "../backend";
import PageHeader from "../components/PageHeader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useTransactionHistory } from "../hooks/useQueries";

type FilterTab = "all" | "deposits" | "withdrawals";

function formatDate(ns: bigint) {
  return new Date(Number(ns) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-400/10 text-yellow-400",
    approved: "bg-green-400/10 text-green-400",
    rejected: "bg-red-400/10 text-red-400",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[status] || "bg-white/10 text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

function getTransactionStatus(tx: Transaction): string {
  const t = tx.transactionType;
  if (t.__kind__ === "depositRequest") {
    return String(t.depositRequest.status);
  }
  return String(t.withdrawalRequest.status);
}

function TransactionRow({ tx, index }: { tx: Transaction; index: number }) {
  const isDeposit = tx.transactionType.__kind__ === "depositRequest";
  const status = getTransactionStatus(tx);

  return (
    <div
      data-ocid={`history.item.${index + 1}`}
      className="glass-card rounded-xl p-4 flex items-center gap-3"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isDeposit ? "bg-emerald-400/10" : "bg-rose-400/10"
        }`}
      >
        {isDeposit ? (
          <ArrowDownCircle size={20} className="text-emerald-400" />
        ) : (
          <ArrowUpCircle size={20} className="text-rose-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {isDeposit ? "Deposit" : "Withdrawal"}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(tx.createdAt)}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className={`text-sm font-semibold ${isDeposit ? "text-emerald-400" : "text-rose-400"}`}
        >
          {isDeposit ? "+" : "-"}₹{tx.amount.toFixed(2)}
        </p>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: transactions, isLoading } = useTransactionHistory();
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  if (!identity) return null;

  const filtered = (transactions || []).filter((tx) => {
    if (filter === "deposits")
      return tx.transactionType.__kind__ === "depositRequest";
    if (filter === "withdrawals")
      return tx.transactionType.__kind__ === "withdrawalRequest";
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "deposits", label: "Deposits" },
    { key: "withdrawals", label: "Withdrawals" },
  ];

  return (
    <div className="min-h-dvh pb-24">
      <PageHeader title="Transaction History" />

      <div className="px-4">
        {/* Filter Tabs */}
        <div data-ocid="history.tab" className="flex gap-2 mb-4">
          {tabs.map(({ key, label }) => (
            <button
              type="button"
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === key
                  ? "bg-yellow-400 text-black"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="history.empty_state"
            className="glass-card rounded-2xl p-10 text-center"
          >
            <Clock size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No transactions found.</p>
          </div>
        ) : (
          <div data-ocid="history.list" className="space-y-2">
            {filtered.map((tx, i) => (
              <TransactionRow key={String(tx.id)} tx={tx} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
