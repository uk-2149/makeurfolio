"use client";

import React, { useState } from "react";
import { X, Mail, ArrowRight } from "lucide-react";
import { signIn, authClient } from "@/src/lib/auth-client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  triggerSource?: "navbar" | "generation";
}

export function AuthModal({ isOpen, onClose, onSuccess, triggerSource = "generation" }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"initial" | "otp">("initial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: triggerSource === "navbar" ? "/dashboard" : "/", // Returns to dashboard directly or homepage where state is restored
      });
    } catch (err) {
      console.error(err);
      setError("Failed to sign in with Google.");
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (res.error) {
        setError(res.error.message || "Failed to send OTP.");
        setLoading(false);
        return;
      }
      setStep("otp");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP.");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setError(null);
    try {
      const res = await signIn.emailOtp({
        email,
        otp,
      });
      
      if (res.error) {
        setError(res.error.message || "Invalid OTP.");
        setLoading(false);
        return;
      }
      
      setLoading(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Invalid OTP.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card-bg rounded-2xl shadow-xl overflow-hidden border border-border text-foreground">
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-input-bg text-secondary hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Claim your portfolio</h2>
            <p className="text-[13px] text-secondary">
              Your portfolio will be generated and saved to your account.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 text-xs text-red-600 bg-red-500/10 dark:bg-red-500/10 dark:text-red-400 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          {step === "initial" ? (
            <div className="space-y-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.81002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
                  <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
                  <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
                  <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.185 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card-bg px-2 text-[11px] text-secondary tracking-wider uppercase font-medium">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-input-bg text-[13px] text-foreground border border-transparent focus:border-border rounded-lg outline-none focus:ring-0 placeholder:text-secondary/60 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-[13px] font-medium transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send code"}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <p className="text-[13px] text-secondary">
                  We sent a code to <strong className="font-medium text-foreground">{email}</strong>
                </p>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full px-4 py-2.5 text-center tracking-widest text-lg font-mono bg-input-bg text-foreground border border-transparent focus:border-border rounded-lg outline-none focus:ring-0 placeholder:text-secondary/60 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-[13px] font-medium transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify code"}
                {!loading && <ArrowRight size={18} />}
              </button>
              <button
                type="button"
                onClick={() => setStep("initial")}
                className="w-full py-2 text-xs text-secondary hover:text-foreground transition-colors"
              >
                Back to email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
