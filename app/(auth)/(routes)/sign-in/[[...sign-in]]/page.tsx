"use client";

import { useEffect, useState } from "react";
import { SignIn, useSignIn } from "@clerk/nextjs";
import { Eye } from "lucide-react";

// Fixed credentials for a shared, read-only-feeling "just looking around"
// account — lets anyone jump straight into the dashboard without creating
// an account, in one click.
const VISITOR_EMAIL = "visitor@gmail.com";
const VISITOR_PASSWORD = "visitor!!1";

function VisitorLoginButton() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVisitorLogin = async () => {
    if (!isLoaded || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signIn.create({
        strategy: "password",
        identifier: VISITOR_EMAIL,
        password: VISITOR_PASSWORD,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // A client-side router.push() here can race Clerk's session cookie
        // propagating to the server: middleware sees "no session" for a beat,
        // bounces back to /sign-in, then the real navigation lands — a visible
        // flash. A full navigation waits for the cookie to be set first.
        window.location.href = "/dashboard";
      } else {
        setError("Visitor login is temporarily unavailable — please sign in below instead.");
      }
    } catch {
      setError("Visitor login is temporarily unavailable — please sign in below instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mb-5">
      <button
        onClick={handleVisitorLogin}
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-xl border border-violet-400/40 bg-gradient-to-r from-violet-600/15 to-cyan-600/15 px-5 py-4 text-left transition hover:border-violet-300/70 hover:from-violet-600/25 hover:to-cyan-600/25 disabled:opacity-60"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white">{loading ? "Signing you in…" : "Continue as Visitor"}</p>
            <p className="text-xs text-white/60">Just checking things out? Jump straight in — no account needed.</p>
          </div>
        </div>
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-widest text-white/30">or sign in</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
    </div>
  );
}

export default function Page() {
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    // Give the visitor box's own pop-in a moment to land, then grow the
    // sign-in box open. Both live in a vertically-centered flex column, so
    // as the sign-in box's height expands the whole group re-centers —
    // reading as the visitor box gliding upward while sign-in fades in
    // beneath it, one continuous motion instead of two separate pops.
    const timer = setTimeout(() => setShowSignIn(true), 350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex w-full flex-col items-center">
      <div
        style={{
          animation: "visitor-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}
      >
        <VisitorLoginButton />
      </div>
      <div
        style={{
          maxHeight: showSignIn ? 900 : 0,
          opacity: showSignIn ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease 0.15s",
        }}
      >
        <SignIn />
      </div>
      <style jsx>{`
        @keyframes visitor-pop-in {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
