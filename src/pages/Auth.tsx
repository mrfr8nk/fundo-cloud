import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import logo from "/fundo-logo.png";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/app");
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/app" },
        });
        if (error) throw error;
        toast.success("Account created. Welcome!");
        navigate("/app");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/app");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
    if (result.error) { toast.error("Google sign-in failed"); return; }
    if (result.redirected) return;
    navigate("/app");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={logo} alt="Fundo CDN" className="h-12 w-auto drop-shadow-[0_0_16px_oklch(0.72_0.22_215/0.6)]" />
        </Link>
        <div className="glass-strong rounded-2xl p-8 neon-border relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Sign in to continue" : "Start uploading in seconds"}
          </p>

          <Button onClick={google} variant="outline" className="w-full mt-6 h-11 glass">
            <svg className="size-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21.35 11.1H12v3.2h5.35c-.5 2.4-2.55 4.1-5.35 4.1a5.9 5.9 0 1 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.3-2.3A9.1 9.1 0 0 0 12 3a9 9 0 1 0 0 18c5.2 0 8.65-3.65 8.65-8.8 0-.5-.05-.85-.1-1.1Z" />
            </svg>
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px bg-border flex-1" /> OR <div className="h-px bg-border flex-1" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1.5" />
            </div>
            <Button disabled={busy} type="submit" className="w-full h-11 bg-primary text-primary-foreground neon-border">
              {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary hover:underline">
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/terms" className="hover:text-foreground underline underline-offset-2">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="hover:text-foreground underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
