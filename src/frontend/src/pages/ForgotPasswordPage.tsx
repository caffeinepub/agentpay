import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Send } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (phone.trim()) setSent(true);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center mx-auto mb-4">
            <Send size={24} className="text-yellow-400" />
          </div>
          <h1 className="font-display text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Enter your mobile number to receive a reset link
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          {!sent ? (
            <>
              <div className="mb-5">
                <label
                  htmlFor="forgot-phone"
                  className="block text-sm font-medium text-muted-foreground mb-1.5"
                >
                  Mobile Number
                </label>
                <input
                  id="forgot-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-yellow-400/50 transition-all text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Send Reset Link
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Link Sent!</h3>
              <p className="text-muted-foreground text-sm">
                A reset link has been sent to{" "}
                <span className="text-foreground font-medium">{phone}</span>.
                Check your messages.
              </p>
            </div>
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
