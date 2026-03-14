import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Building2, CreditCard, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useBankAccounts, useDeleteBankAccount } from "../hooks/useQueries";

export default function AccountsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: banks, isLoading } = useBankAccounts();
  const deleteBank = useDeleteBankAccount();

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  const handleDelete = async (id: bigint) => {
    try {
      await deleteBank.mutateAsync(id);
      toast.success("Bank account removed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove bank account");
    }
  };

  if (!identity) return null;

  return (
    <div className="min-h-dvh pb-24">
      <PageHeader title="Bank Accounts" />

      <div className="px-4">
        <button
          type="button"
          data-ocid="accounts.add_button"
          onClick={() => navigate({ to: "/add-bank" })}
          className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3.5 rounded-xl mb-4 transition-all shadow-glow-sm"
        >
          <Plus size={18} />
          Add New Bank Account
        </button>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton
                key={i}
                className="h-20 w-full rounded-2xl bg-white/5"
              />
            ))}
          </div>
        ) : !banks || banks.length === 0 ? (
          <div
            data-ocid="accounts.empty_state"
            className="glass-card rounded-2xl p-10 text-center"
          >
            <CreditCard
              size={40}
              className="text-muted-foreground mx-auto mb-3"
            />
            <p className="font-medium mb-1">No Bank Accounts</p>
            <p className="text-muted-foreground text-sm">
              Add a bank account to start withdrawing.
            </p>
          </div>
        ) : (
          <div data-ocid="accounts.list" className="space-y-3">
            {banks.map((bank, i) => (
              <div
                key={String(bank.id)}
                data-ocid={`accounts.item.${i + 1}`}
                className="glass-card rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-400/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={22} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {bank.accountName}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    ****{bank.accountNumber.slice(-4)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bank.ifscCode}
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid={`accounts.delete_button.${i + 1}`}
                  onClick={() => handleDelete(bank.id)}
                  disabled={deleteBank.isPending}
                  className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  {deleteBank.isPending ? (
                    <Loader2 size={14} className="animate-spin text-red-400" />
                  ) : (
                    <Trash2 size={14} className="text-red-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
