import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Whisper" },
      { name: "description", content: "Sign in or continue anonymously to start sharing." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/feed", replace: true });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedEmail = email.trim();
      const { data, error } =
        mode === "signup"
          ? await supabase.auth.signUp({
              email: normalizedEmail,
              password,
              options: { emailRedirectTo: `${window.location.origin}/feed` },
            })
          : await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            });
      if (error) throw error;
      if (mode === "signup" && !data.session) {
        toast.success("Check your email to confirm your account.");
        return;
      }
      toast.success(mode === "signup" ? "Welcome — you're in." : "Welcome back.");
      navigate({ to: "/feed", replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      toast.success("You're in as a guest.");
      navigate({ to: "/feed", replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't start guest session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <header className="text-center mb-8 animate-float-up">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" /> 100% anonymous
          </div>
          <h1 className="mt-4 text-4xl font-bold gradient-text">Whisper</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Share confessions, join communities, message privately. No real names, ever.
          </p>
        </header>

        <div className="glass-strong rounded-3xl p-6 animate-float-up">
          <div className="flex p-1 rounded-full bg-muted/40 mb-5 text-sm">
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-full transition ${mode === "signup" ? "gradient-primary-bg text-primary-foreground font-semibold" : "text-muted-foreground"}`}
            >Create account</button>
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 rounded-full transition ${mode === "signin" ? "gradient-primary-bg text-primary-foreground font-semibold" : "text-muted-foreground"}`}
            >Sign in</button>
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl bg-input/60 px-4 py-3 outline-none border border-border focus:border-primary"
            />
            <div className="relative">
              <input
                type={showPw ? "text" : "password"} required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Password (6+ chars)"
                className="w-full rounded-2xl bg-input/60 px-4 py-3 pr-12 outline-none border border-border focus:border-primary"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <button disabled={loading} type="submit"
              className="w-full rounded-2xl gradient-primary-bg text-primary-foreground py-3 font-semibold disabled:opacity-60">
              {loading ? "Please wait…" : mode === "signup" ? "Create anonymous account" : "Sign in"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
          </div>

          <button onClick={handleGuest} disabled={loading}
            className="w-full rounded-2xl glass py-3 font-medium hover:bg-accent/50 transition">
            Continue as Guest
          </button>
          <p className="mt-3 text-[11px] text-center text-muted-foreground">
            Guest accounts can't be recovered if you sign out or clear data.
          </p>
        </div>
      </div>
    </main>
  );
}
