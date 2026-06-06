import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, MessageSquare, Github, Send } from "lucide-react";
import { toast } from "sonner";
import logo from "/fundo-logo.png";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    toast.success("Message sent! We'll get back to you soon.");
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Fundo CDN" className="h-9 w-auto drop-shadow-[0_0_12px_oklch(0.72_0.22_215/0.5)]" />
        </Link>
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="size-4" /> Back to home
          </Button>
        </Link>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">Get in touch</h1>
          <p className="mt-3 text-muted-foreground">Have a question, bug report, or partnership inquiry? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact methods */}
          <div className="space-y-4">
            <ContactCard
              icon={<Mail className="size-5 text-primary" />}
              title="Email"
              desc="For general enquiries and support."
              value="hello@fundocdn.com"
              href="mailto:hello@fundocdn.com"
            />
            <ContactCard
              icon={<Github className="size-5 text-primary" />}
              title="GitHub"
              desc="Bug reports and feature requests."
              value="github.com/fundo-cdn"
              href="https://github.com"
            />
            <ContactCard
              icon={<MessageSquare className="size-5 text-primary" />}
              title="API & Developer Support"
              desc="Integration help and API questions."
              value="support@fundocdn.com"
              href="mailto:support@fundocdn.com"
            />

            <div className="glass-card rounded-2xl p-6 space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Response Time</p>
              <p className="text-sm text-muted-foreground">We typically respond within <span className="text-foreground font-medium">24–48 hours</span> on business days.</p>
            </div>
          </div>

          {/* Form */}
          <div className="glass-strong rounded-2xl p-8 neon-border relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center neon-border">
                  <Send className="size-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Message sent!</h2>
                <p className="text-sm text-muted-foreground">We'll get back to you within 24–48 hours.</p>
                <Button variant="ghost" size="sm" onClick={() => { setSent(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}>
                  Send another
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-6">Send us a message</h2>
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Your name" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1.5" placeholder="What's this about?" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className="mt-1.5 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={sending} className="w-full h-11 bg-primary text-primary-foreground neon-border gap-2">
                    {sending ? "Sending…" : <><Send className="size-4" /> Send message</>}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}

function ContactCard({ icon, title, desc, value, href }: {
  icon: React.ReactNode; title: string; desc: string; value: string; href: string;
}) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
      className="glass-card rounded-2xl p-5 flex items-start gap-4 group block">
      <div className="size-10 rounded-lg glass flex items-center justify-center shrink-0 group-hover:neon-border transition">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
        <div className="text-xs text-primary mt-1 truncate">{value}</div>
      </div>
    </a>
  );
}

function LegalFooter() {
  return (
    <footer className="relative z-10 border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
      <div className="flex flex-wrap justify-center gap-4 mb-2">
        <Link to="/" className="hover:text-foreground transition">Home</Link>
        <Link to="/terms" className="hover:text-foreground transition">Terms of Service</Link>
        <Link to="/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
        <Link to="/contact" className="hover:text-foreground transition">Contact</Link>
      </div>
      © {new Date().getFullYear()} Fundo CDN™ — Developer Darrell Mucheri. All rights reserved.
    </footer>
  );
}
