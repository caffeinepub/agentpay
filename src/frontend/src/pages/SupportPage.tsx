import { useNavigate } from "@tanstack/react-router";
import { Clock, MessageCircle, Phone, Send } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { SiTelegram, SiWhatsapp } from "react-icons/si";
import PageHeader from "../components/PageHeader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function SupportPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  if (!identity) return null;

  return (
    <div className="min-h-dvh pb-24">
      <PageHeader title="Support" />

      <div className="px-4 space-y-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass-card rounded-2xl p-6 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-yellow-400" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Need Help?</h2>
          <p className="text-muted-foreground text-sm">
            We&apos;re here for you 24/7. Reach out through any channel below.
          </p>
        </motion.div>

        {/* Contact Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="space-y-3"
        >
          <a
            href="https://t.me/agentpay_support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "rgba(0, 136, 204, 0.15)",
              border: "1px solid rgba(0, 136, 204, 0.3)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0, 136, 204, 0.2)" }}
            >
              <SiTelegram size={24} style={{ color: "#0088CC" }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Telegram Support</p>
              <p className="text-sm text-muted-foreground">@agentpay_support</p>
            </div>
            <Send size={16} className="text-muted-foreground" />
          </a>

          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "rgba(37, 211, 102, 0.15)",
              border: "1px solid rgba(37, 211, 102, 0.3)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(37, 211, 102, 0.2)" }}
            >
              <SiWhatsapp size={24} style={{ color: "#25D366" }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">WhatsApp Support</p>
              <p className="text-sm text-muted-foreground">+91 99999 99999</p>
            </div>
            <Send size={16} className="text-muted-foreground" />
          </a>
        </motion.div>

        {/* Support Hours */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-yellow-400" />
            <p className="text-sm font-semibold">Support Hours</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monday – Friday</span>
              <span className="font-medium">9:00 AM – 9:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saturday – Sunday</span>
              <span className="font-medium">10:00 AM – 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Emergency</span>
              <span className="font-medium text-yellow-400">
                24/7 via Telegram
              </span>
            </div>
          </div>
        </motion.div>

        {/* Phone */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
            <Phone size={18} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Helpline</p>
            <p className="font-medium text-sm">1800-000-AGENT (toll-free)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
