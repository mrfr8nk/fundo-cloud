import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import {
  Zap, Shield, Code2, ArrowRight, KeyRound, Gauge, FolderTree,
} from "lucide-react";
import logo from "/fundo-logo.png";

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between animate-fade-in">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Fundo CDN" className="h-9 w-auto drop-shadow-[0_0_12px_oklch(0.72_0.22_215/0.6)]" />
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          <Link to="/app/docs" className="hover:text-foreground transition">Docs</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth">
            <Button size="sm" className="bg-primary text-primary-foreground neon-border">
              Get started
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-8">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Powered by Cloudflare R2 · Edge delivery
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            The CDN built for <br />
            <span className="text-gradient">developers shipping fast.</span>
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload, deliver, and manage files at the edge. Smart short links,
            signed URLs, per-key analytics, and a developer API that just works.
          </p>
        </Reveal>
        <Reveal delay={280}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground neon-border h-12 px-7 transition-transform hover:-translate-y-0.5">
                Start uploading <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link to="/app/docs">
              <Button size="lg" variant="outline" className="h-12 px-7 glass transition-transform hover:-translate-y-0.5">
                Read the docs
              </Button>
            </Link>
          </div>
        </Reveal>

        {/* Hero demo card */}
        <Reveal delay={380} y={40}>
          <div className="mt-16 mx-auto max-w-4xl">
            <div className="glass-strong rounded-2xl p-1.5 neon-border">
              <div className="rounded-xl bg-background/60 p-6 text-left font-mono text-sm relative overflow-hidden">
                <div className="shimmer-line" />
                <div className="text-muted-foreground"># Share with a short, smart link</div>
                <div className="mt-2">
                  <span className="text-primary">https://</span>cdn.synapex.co.zw/s/<span className="text-accent">k7m2qx9p</span>
                </div>
                <div className="mt-4 text-muted-foreground"># Or upload via the API</div>
                <div className="mt-2">
                  <span className="text-accent">curl</span>{" "}
                  <span className="text-primary">-X POST</span> https://cdn.synapex.co.zw/api/upload \<br />
                  {"  "}<span className="text-primary">-H</span> "Authorization: Bearer fundo_live_xxx" \<br />
                  {"  "}<span className="text-primary">-F</span> "file=@logo.png"
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-3">
            Everything you need to <span className="text-gradient">ship files faster.</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12">Built for speed, built for developers.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Zap, title: "Edge delivery", desc: "Cloudflare's global network puts your files milliseconds from every user." },
            { icon: Shield, title: "Signed URLs", desc: "Time-boxed URLs for private files. Hotlink-safe public links by default." },
            { icon: KeyRound, title: "Smart short links", desc: "Every file gets a memorable /s/xxxx link on your domain. No long signed URLs." },
            { icon: FolderTree, title: "Organized", desc: "Folders, rename, tags, favorites, and full-text search across your library." },
            { icon: Gauge, title: "Quotas & analytics", desc: "Track storage and bandwidth in real-time. Enforce limits at the edge." },
            { icon: Code2, title: "DX-first", desc: "Drop-in REST API, copy-paste examples for every language." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <div className="glass-card rounded-2xl p-6 h-full relative overflow-hidden group">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "radial-gradient(circle at 50% 0%, oklch(0.72 0.22 215 / 0.08), transparent 70%)" }} />
                <f.icon className="size-6 text-primary relative z-10" />
                <h3 className="mt-4 font-semibold relative z-10">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground relative z-10">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <Reveal><h2 className="text-4xl font-bold tracking-tight">Simple pricing.</h2></Reveal>
        <Reveal delay={80}><p className="mt-3 text-muted-foreground">Start free. Upgrade when you outgrow it.</p></Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { name: "Free", price: "$0", desc: "5 GB storage · 50 GB bandwidth", cta: "Get started", featured: false },
            { name: "Pro", price: "$19", desc: "100 GB storage · 1 TB bandwidth", cta: "Upgrade", featured: true },
            { name: "Scale", price: "Custom", desc: "Volume pricing · SLA · SSO", cta: "Talk to us", featured: false },
          ].map((p, i) => (
            <Reveal key={p.name} delay={i * 100} y={32}>
              <div className={`glass-card rounded-2xl p-8 text-left relative overflow-hidden ${p.featured ? "neon-border" : ""}`}>
                {p.featured && (
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}
                <div className="text-xs text-muted-foreground uppercase tracking-widest">{p.name}</div>
                <div className="mt-2 text-4xl font-bold">
                  {p.price}
                  {p.price !== "Custom" && <span className="text-base text-muted-foreground font-normal">/mo</span>}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
                <Link to="/auth"><Button className={`w-full mt-6 ${p.featured ? "bg-primary text-primary-foreground neon-border" : ""}`}>{p.cta}</Button></Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/40 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-muted-foreground">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <img src={logo} alt="Fundo CDN" className="h-10 w-auto" />
            <p className="text-xs leading-relaxed">
              Lightning-fast file hosting &amp; delivery built on Cloudflare R2.
              <br />
              <span className="text-gradient-green font-medium">Faster · Smarter · Everywhere.</span>
            </p>
            <p className="text-xs">
              © {new Date().getFullYear()} Fundo CDN<br />
              Built by <span className="text-foreground font-medium">Developer Darrell Mucheri</span>
            </p>
          </div>
          {/* Product */}
          <div className="space-y-2">
            <div className="text-foreground font-semibold mb-3 text-xs uppercase tracking-widest">Product</div>
            <a href="#features" className="block hover:text-foreground transition">Features</a>
            <a href="#pricing" className="block hover:text-foreground transition">Pricing</a>
            <Link to="/app/docs" className="block hover:text-foreground transition">API Docs</Link>
            <Link to="/auth" className="block hover:text-foreground transition">Get started</Link>
          </div>
          {/* Company */}
          <div className="space-y-2">
            <div className="text-foreground font-semibold mb-3 text-xs uppercase tracking-widest">Company</div>
            <Link to="/contact" className="block hover:text-foreground transition">Contact</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="block hover:text-foreground transition">GitHub</a>
          </div>
          {/* Legal */}
          <div className="space-y-2">
            <div className="text-foreground font-semibold mb-3 text-xs uppercase tracking-widest">Legal</div>
            <Link to="/terms" className="block hover:text-foreground transition">Terms of Service</Link>
            <Link to="/privacy" className="block hover:text-foreground transition">Privacy Policy</Link>
            <Link to="/contact" className="block hover:text-foreground transition">Contact Us</Link>
          </div>
        </div>
        <div className="border-t border-border/30 py-4 text-center text-xs text-muted-foreground">
          Fundo CDN™ is a trademark of Developer Darrell Mucheri. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
