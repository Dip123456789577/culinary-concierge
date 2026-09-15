import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In | Atelier Salon" }, { name: "description", content: "Sign in to review restaurant enquiries." }, { property: "og:title", content: "Sign In | Atelier Salon" }, { property: "og:description", content: "Sign in to review restaurant enquiries." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (result.error) { setError("That sign-in did not work. Please check your details."); return; }
    await navigate({ to: "/submissions" });
  };

  return <main className="flex min-h-screen items-center justify-center bg-primary px-5 py-12 text-primary-foreground"><div className="w-full max-w-md"><Link to="/" className="mb-12 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-primary-foreground/70 hover:text-primary-foreground"><ArrowLeft className="size-4" /> Back to site</Link><p className="eyebrow text-accent">Private workspace</p><h1 className="mt-3 font-serif text-5xl">Welcome back.</h1><p className="mt-5 text-sm leading-7 text-primary-foreground/70">Sign in to review reservation and contact enquiries sent through the concierge.</p><form onSubmit={signIn} className="mt-10 space-y-4"><Input required type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40" /><Input required type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40" />{error && <p className="text-sm text-destructive-foreground">{error}</p>}<Button disabled={loading} type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">{loading ? "Signing in…" : "Open enquiries"} <ArrowRight /></Button></form></div></main>;
}