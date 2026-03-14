import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRegister } from "../hooks/useQueries";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const registerMutation = useRegister();

  const [step, setStep] = useState<"auth" | "profile">(
    identity ? "profile" : "auth",
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleAuth = async () => {
    try {
      await login();
      setStep("profile");
    } catch {
      toast.error("Authentication failed");
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await registerMutation.mutateAsync({ phone, name });
      toast.success("Account created successfully!");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    }
  };

  const busy = loginStatus === "logging-in" || registerMutation.isPending;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-yellow-400/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center mb-3 shadow-glow">
            <Zap size={28} className="text-black" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Join AgentPay today
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          {step === "auth" ? (
            <>
              <h2 className="font-display text-lg font-semibold mb-2">
                Step 1: Verify Identity
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Connect your Internet Identity to get started securely.
              </p>
              <button
                type="button"
                onClick={handleAuth}
                disabled={busy}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Zap size={18} />
                )}
                {busy ? "Connecting..." : "Connect Internet Identity"}
              </button>
            </>
          ) : (
            <>
              <h2 className="font-display text-lg font-semibold mb-2">
                Step 2: Your Details
              </h2>
              <p className="text-muted-foreground text-sm mb-5">
                Fill in your account information
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="reg-name"
                    className="block text-sm font-medium text-muted-foreground mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="reg-name"
                    data-ocid="register.name_input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400/50 transition-all text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-phone"
                    className="block text-sm font-medium text-muted-foreground mb-1.5"
                  >
                    Mobile Number
                  </label>
                  <input
                    id="reg-phone"
                    data-ocid="register.phone_input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400/50 transition-all text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-sm font-medium text-muted-foreground mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="reg-password"
                    data-ocid="register.password_input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400/50 transition-all text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-confirm"
                    className="block text-sm font-medium text-muted-foreground mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="reg-confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400/50 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                data-ocid="register.submit_button"
                onClick={handleSubmit}
                disabled={busy}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3.5 rounded-xl mt-6 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy ? <Loader2 size={18} className="animate-spin" /> : null}
                {busy ? "Creating Account..." : "Create Account"}
              </button>
            </>
          )}
        </div>

        <div className="text-center mt-5">
          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
