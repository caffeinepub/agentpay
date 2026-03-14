import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Building2, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useBankAccounts, useSubmitWithdrawal } from "../hooks/useQueries";

export default function WithdrawPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: banks, isLoading: banksLoading } = useBankAccounts();
  const withdrawMutation = useSubmitWithdrawal();

  const [amount, setAmount] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!selectedBankId) {
      toast.error("Please select a bank account");
      return;
    }
    try {
      await withdrawMutation.mutateAsync({
        amount: Number(amount),
        bankId: BigInt(selectedBankId),
      });
      setSuccess(true);
      toast.success("Withdrawal request submitted!");
    } catch (err: any) {
      toast.error(err?.message || "Withdrawal failed");
    }
  };

  if (!identity) return null;

  if (success) {
    return (
      <div className="min-h-dvh flex flex-col">
        <PageHeader title="Withdraw" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">
              Withdrawal Requested!
            </h2>
            <p className="text-muted-foreground mb-8">
              Your withdrawal will be processed within 24 hours.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="bg-yellow-400 text-black font-semibold px-8 py-3 rounded-xl"
            >
              Back to Home
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-24">
      <PageHeader title="Withdraw" />

      <div className="px-4 space-y-4">
        <div className="glass-card rounded-2xl p-5">
          <label
            htmlFor="withdraw-amount"
            className="block text-sm font-medium text-muted-foreground mb-2"
          >
            Amount to Withdraw
          </label>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-yellow-400">₹</span>
            <input
              id="withdraw-amount"
              data-ocid="withdraw.amount_input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-3xl font-bold text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex gap-2 mt-3">
            {["500", "1000", "5000", "10000"].map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setAmount(amt)}
                className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Select Bank Account
          </p>
          {banksLoading ? (
            <div className="text-sm text-muted-foreground">
              Loading banks...
            </div>
          ) : !banks || banks.length === 0 ? (
            <div className="text-center py-4">
              <AlertCircle
                size={32}
                className="text-muted-foreground mx-auto mb-2"
              />
              <p className="text-sm text-muted-foreground mb-3">
                No bank accounts added yet.
              </p>
              <Link
                to="/add-bank"
                className="text-yellow-400 text-sm font-medium"
              >
                + Add Bank Account
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {banks.map((bank) => (
                <button
                  type="button"
                  key={String(bank.id)}
                  onClick={() => setSelectedBankId(String(bank.id))}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    selectedBankId === String(bank.id)
                      ? "border-yellow-400/60 bg-yellow-400/5"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {bank.accountName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ****{bank.accountNumber.slice(-4)}
                    </p>
                  </div>
                  {selectedBankId === String(bank.id) && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                      <span className="text-black text-[8px] font-bold">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hidden select for ocid */}
        <select
          data-ocid="withdraw.bank_select"
          value={selectedBankId}
          onChange={(e) => setSelectedBankId(e.target.value)}
          className="sr-only"
        >
          {(banks || []).map((b) => (
            <option key={String(b.id)} value={String(b.id)}>
              {b.accountName}
            </option>
          ))}
        </select>

        <button
          type="button"
          data-ocid="withdraw.submit_button"
          onClick={handleSubmit}
          disabled={withdrawMutation.isPending}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-glow-sm"
        >
          {withdrawMutation.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : null}
          {withdrawMutation.isPending
            ? "Processing..."
            : "Submit Withdrawal Request"}
        </button>
      </div>
    </div>
  );
}
