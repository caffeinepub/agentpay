import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const [isLoading, setIsLoading] = useState(false);

  if (identity) {
    navigate({ to: "/" });
    return null;
  }

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
      navigate({ to: "/" });
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const busy = isLoading || loginStatus === "logging-in";

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-yellow-400/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center mb-4 shadow-glow">
            <Zap size={32} className="text-black" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            AgentPay
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your trusted payment agent platform
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold mb-1">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in to your agent account
          </p>

          <div className="mb-4">
            <label
              htmlFor="login-phone"
              className="block text-sm font-medium text-muted-foreground mb-1.5"
            >
              Mobile Number
            </label>
            <input
              id="login-phone"
              data-ocid="login.phone_input"
              type="tel"
              placeholder="+91 9876543210"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/30 transition-all text-sm"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-muted-foreground mb-1.5"
            >
              Password
            </label>
            <input
              id="login-password"
              data-ocid="login.password_input"
              type="password"
              placeholder="Enter your password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/30 transition-all text-sm"
            />
          </div>

          <button
            type="button"
            data-ocid="login.submit_button"
            onClick={handleLogin}
            disabled={busy}
            className="w-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-black font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-glow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : null}
            {busy ? "Signing in..." : "Login"}
          </button>

          <div className="flex justify-center mt-4">
            <Link
              to="/forgot-password"
              data-ocid="login.forgot_password_link"
              className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <div className="text-center mt-5">
          <span className="text-muted-foreground text-sm">
            Don&apos;t have an account?{" "}
          </span>
          <Link
            to="/register"
            data-ocid="login.register_link"
            className="text-yellow-400 text-sm font-semibold hover:text-yellow-300 transition-colors"
          >
            Register
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 opacity-60">
          Secured by Internet Identity
        </p>
      </motion.div>
    </div>
  );
}
