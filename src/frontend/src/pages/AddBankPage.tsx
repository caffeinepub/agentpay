import { useNavigate } from "@tanstack/react-router";
import { Building2, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddBankAccount } from "../hooks/useQueries";

export default function AddBankPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const addBank = useAddBankAccount();

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Enter account holder name");
      return;
    }
    if (!number.trim() || number.length < 8) {
      toast.error("Enter a valid account number");
      return;
    }
    if (!ifsc.trim() || ifsc.length < 11) {
      toast.error("Enter a valid IFSC code");
      return;
    }
    try {
      await addBank.mutateAsync({ name, number, ifsc: ifsc.toUpperCase() });
      setSuccess(true);
      toast.success("Bank account added!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add bank account");
    }
  };

  if (!identity) return null;

  if (success) {
    return (
      <div className="min-h-dvh flex flex-col">
        <PageHeader title="Add Bank" />
        <div
          data-ocid="addbank.success_state"
          className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">
              Bank Added!
            </h2>
            <p className="text-muted-foreground mb-8">
              Your bank account has been saved successfully.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setName("");
                  setNumber("");
                  setIfsc("");
                }}
                className="border border-white/20 text-foreground font-medium px-6 py-3 rounded-xl"
              >
                Add Another
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/accounts" })}
                className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-xl"
              >
                View Banks
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-24">
      <PageHeader title="Add Bank Account" />

      <div className="px-4">
        <div className="glass-card rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
              <Building2 size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Bank Account Details</p>
              <p className="text-xs text-muted-foreground">
                All fields are required
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="bank-name"
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                Account Holder Name
              </label>
              <input
                id="bank-name"
                data-ocid="addbank.name_input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="As per bank records"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400/50 transition-all text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="bank-number"
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                Account Number
              </label>
              <input
                id="bank-number"
                data-ocid="addbank.number_input"
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter account number"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400/50 transition-all text-sm font-mono tracking-wider"
              />
            </div>
            <div>
              <label
                htmlFor="bank-ifsc"
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                IFSC Code
              </label>
              <input
                id="bank-ifsc"
                data-ocid="addbank.ifsc_input"
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                maxLength={11}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400/50 transition-all text-sm font-mono uppercase tracking-widest"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          data-ocid="addbank.submit_button"
          onClick={handleSubmit}
          disabled={addBank.isPending}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-glow-sm"
        >
          {addBank.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : null}
          {addBank.isPending ? "Saving..." : "Save Bank Account"}
        </button>
      </div>
    </div>
  );
}
