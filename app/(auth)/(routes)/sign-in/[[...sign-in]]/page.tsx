"use client";

import { useState } from "react";
import { SignIn, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

// Fixed credentials for a shared, read-only-feeling "just looking around"
// account — lets anyone jump straight into the dashboard without creating
// an account, in one click.
const VISITOR_EMAIL = "visitor@gmail.com";
const VISITOR_PASSWORD = "visitor!!1";

function VisitorLoginButton() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
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
        router.push("/dashboard");
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
  return (
    <div className="flex flex-col items-center">
      <VisitorLoginButton />
      <SignIn />
    </div>
  );
}
