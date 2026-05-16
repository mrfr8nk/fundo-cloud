import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Cloud, Zap, Shield, Code2, Globe2, ArrowRight, KeyRound, Gauge, FolderTree, Github,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <header className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent neon-border" />
          <span className="font-semibold tracking-tight text-lg">Fundo CDN</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          <Link to="/app/docs" className="hover:text-foreground transition">Docs</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth"><Button size="sm" className="bg-primary text-primary-foreground">Get started</Button></Link>
        </div>
      </header>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-8">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          Powered by Cloudflare R2 · Edge delivery
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          The CDN built for <br />
          <span className="text-gradient">developers shipping fast.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload, deliver, and manage files at the edge. Presigned uploads, signed URLs,
          per-key analytics, and a developer API that just works.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="bg-primary text-primary-foreground neon-border h-12 px-6">
              Start uploading <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
          <Link to="/app/docs">
            <Button size="lg" variant="outline" className="h-12 px-6 glass">
              Read the docs
            </Button>
          </Link>
        </div>

        <div className="mt-16 mx-auto max-w-4xl">
          <div className="glass-strong rounded-2xl p-1.5">
            <div className="rounded-xl bg-background/60 p-6 text-left font-mono text-sm">
              <div className="text-muted-foreground"># Upload a file with the API</div>
              <div className="mt-2">
                <span className="text-accent">curl</span>{" "}
                <span className="text-primary">-X POST</span> https://cdn.synapex.co.zw/api/upload \<br />
                {"  "}<span className="text-primary">-H</span> "Authorization: Bearer fundo_live_xxx" \<br />
                {"  "}<span className="text-primary">-F</span> "file=@logo.png"
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Zap, title: "Edge delivery", desc: "Cloudflare's global network puts your files milliseconds from every user." },
            { icon: Shield, title: "Signed URLs", desc: "Time-boxed URLs for private files. Hotlink-safe public links by default." },
            { icon: KeyRound, title: "API keys", desc: "Generate, scope, and revoke keys. Per-key usage analytics out of the box." },
            { icon: FolderTree, title: "Organized", desc: "Folders, tags, favorites, and full-text search across your library." },
            { icon: Gauge, title: "Quotas & analytics", desc: "Track storage and bandwidth in real-time. Enforce limits at the edge." },
            { icon: Code2, title: "DX-first", desc: "Drop-in REST API, TypeScript client, copy-paste examples for every language." },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:neon-border transition">
              <f.icon className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold tracking-tight">Simple pricing.</h2>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade when you outgrow it.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { name: "Free", price: "$0", desc: "5 GB storage · 50 GB bandwidth", cta: "Get started" },
            { name: "Pro", price: "$19", desc: "100 GB storage · 1 TB bandwidth", cta: "Upgrade", featured: true },
            { name: "Scale", price: "Custom", desc: "Volume pricing · SLA · SSO", cta: "Talk to us" },
          ].map((p) => (
            <div key={p.name} className={`glass rounded-2xl p-8 text-left ${p.featured ? "neon-border" : ""}`}>
              <div className="text-sm text-muted-foreground">{p.name}</div>
              <div className="mt-2 text-4xl font-bold">{p.price}<span className="text-base text-muted-foreground font-normal">/mo</span></div>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              <Link to="/auth"><Button className="w-full mt-6">{p.cta}</Button></Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 border-t border-border/50 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Globe2 className="size-4" />
          <span>© {new Date().getFullYear()} Fundo CDN</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/app/docs" className="hover:text-foreground">Docs</Link>
          <a href="#" className="hover:text-foreground inline-flex items-center gap-1"><Github className="size-4" /> GitHub</a>
        </div>
      </footer>
    </div>
  );
}
