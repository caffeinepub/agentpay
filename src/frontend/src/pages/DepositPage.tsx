import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle, ImagePlus, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSubmitDeposit } from "../hooks/useQueries";
import { useUploadBlob } from "../hooks/useUploadBlob";

const UPI_ID = "choudhary534@ybl";
const DEPOSIT_AMOUNT = "6000";
const PAYMENT_QR_VALUE = `upi://pay?pa=${UPI_ID}&pn=AgentPay&am=${DEPOSIT_AMOUNT}&cu=INR`;

// QR code rendered as SVG paths (inline, no external lib)
function QRCodeDisplay({ value }: { value: string }) {
  // Use a public QR code image API
  const encodedValue = encodeURIComponent(value);
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodedValue}&format=svg&color=000000&bgcolor=ffffff`}
      alt="UPI QR Code"
      width={180}
      height={180}
      className="rounded-lg"
    />
  );
}

export default function DepositPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const submitDeposit = useSubmitDeposit();
  const { upload, isUploading, progress } = useUploadBlob();

  const [amount, setAmount] = useState(DEPOSIT_AMOUNT);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!file) {
      toast.error("Please upload a payment screenshot");
      return;
    }
    try {
      const blobId = await upload(file);
      await submitDeposit.mutateAsync({
        amount: Number(amount),
        blobId,
        note: note || null,
      });
      setStatus("success");
      toast.success("Deposit request submitted!");
    } catch (err: any) {
      setStatus("error");
      toast.error(err?.message || "Submission failed");
    }
  };

  if (!identity) return null;

  const busy = isUploading || submitDeposit.isPending;

  if (status === "success") {
    return (
      <div className="min-h-dvh flex flex-col">
        <PageHeader title="Deposit" />
        <div
          data-ocid="deposit.success_state"
          className="flex-1 flex flex-col items-center justify-center px-6 pb-24"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-center"
          >
            <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">
              Request Submitted!
            </h2>
            <p className="text-muted-foreground mb-8">
              Your deposit request is under review. We&apos;ll notify you once
              approved.
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
      <PageHeader title="Deposit" />

      <div className="px-4 space-y-4">
        {/* Payment QR Code */}
        <div className="glass-card rounded-2xl p-5" data-ocid="deposit.qr.card">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Scan to Pay
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <QRCodeDisplay value={PAYMENT_QR_VALUE} />
            </div>
            <div className="text-center">
              <p className="text-xs text-yellow-400 font-semibold">AgentPay</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                UPI: {UPI_ID}
              </p>
              <p className="text-xs text-muted-foreground">
                Scan with any UPI app to pay
              </p>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="glass-card rounded-2xl p-5">
          <label
            htmlFor="deposit-amount"
            className="block text-sm font-medium text-muted-foreground mb-2"
          >
            Deposit Amount
          </label>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-yellow-400">₹</span>
            <input
              id="deposit-amount"
              data-ocid="deposit.amount_input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-3xl font-bold text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex gap-2 mt-3">
            {["6000"].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors border border-yellow-400/30 text-yellow-400"
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="glass-card rounded-2xl p-5">
          <label
            htmlFor="deposit-note"
            className="block text-sm font-medium text-muted-foreground mb-2"
          >
            Note (Optional)
          </label>
          <textarea
            id="deposit-note"
            data-ocid="deposit.note_input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for this deposit..."
            rows={3}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
          />
        </div>

        {/* Screenshot Upload */}
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Payment Screenshot
          </p>
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Screenshot"
                className="w-full rounded-xl object-cover max-h-48"
              />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-ocid="deposit.upload_button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-white/20 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-yellow-400/40 transition-colors"
            >
              <ImagePlus size={28} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Tap to upload screenshot
              </span>
              <span className="text-xs text-muted-foreground opacity-60">
                JPG, PNG up to 10MB
              </span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {isUploading && (
            <div data-ocid="deposit.loading_state" className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-yellow-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {status === "error" && (
          <div
            data-ocid="deposit.error_state"
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3"
          >
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-400">
              Submission failed. Please try again.
            </span>
          </div>
        )}

        <button
          type="button"
          data-ocid="deposit.submit_button"
          onClick={handleSubmit}
          disabled={busy}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-glow-sm"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : null}
          {busy
            ? isUploading
              ? `Uploading ${progress}%...`
              : "Submitting..."
            : "Submit Deposit Request"}
        </button>
      </div>
    </div>
  );
}
