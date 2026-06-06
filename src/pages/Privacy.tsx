import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logo from "/fundo-logo.png";

const LAST_UPDATED = "June 6, 2025";

export default function Privacy() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Fundo CDN" className="h-9 w-auto drop-shadow-[0_0_12px_oklch(0.72_0.22_215/0.5)]" />
        </Link>
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="size-4" /> Back to home
          </Button>
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 pb-24">
        <div className="glass-strong rounded-2xl p-8 md:p-12 neon-border relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">

            <Section title="1. Introduction">
              Fundo CDN ("we", "us", or "our"), operated by Developer Darrell Mucheri, respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use the Fundo CDN platform.
            </Section>

            <Section title="2. Information We Collect">
              <p><strong className="text-foreground">Account Information:</strong> Email address, password (hashed), and optional profile details when you register.</p>
              <p className="mt-2"><strong className="text-foreground">Usage Data:</strong> File metadata (names, sizes, MIME types, upload timestamps), API key identifiers, and bandwidth/storage consumption metrics.</p>
              <p className="mt-2"><strong className="text-foreground">Technical Data:</strong> IP addresses, browser type, device information, and access logs retained for security and debugging.</p>
              <p className="mt-2"><strong className="text-foreground">Payment Data:</strong> Handled by third-party processors (e.g., Stripe). We do not store raw card details.</p>
            </Section>

            <Section title="3. How We Use Your Information">
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Provide, operate, and maintain the Service</li>
                <li>Authenticate users and secure accounts</li>
                <li>Enforce storage quotas and generate analytics dashboards</li>
                <li>Send transactional emails (account confirmation, password reset)</li>
                <li>Detect abuse, fraud, and security incidents</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="mt-2">We do not sell your personal data. We do not use your uploaded files for advertising.</p>
            </Section>

            <Section title="4. Data Storage & Security">
              <p>Files are stored on Cloudflare R2 infrastructure. Account data is stored in Supabase-hosted PostgreSQL databases. We apply:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Encryption at rest and in transit (TLS 1.2+)</li>
                <li>Row-level security (RLS) isolating each user's data</li>
                <li>API keys stored as SHA-256 hashes — never plain text</li>
                <li>Time-limited presigned URLs for file access</li>
              </ul>
              <p className="mt-2">No system is 100% secure. We encourage you to use strong, unique passwords.</p>
            </Section>

            <Section title="5. Data Sharing">
              <p>We share data only with:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong className="text-foreground">Cloudflare</strong> — storage and CDN delivery</li>
                <li><strong className="text-foreground">Supabase</strong> — database and authentication</li>
                <li><strong className="text-foreground">Payment processors</strong> — billing (no card data stored by us)</li>
                <li><strong className="text-foreground">Legal authorities</strong> — when required by law</li>
              </ul>
              <p className="mt-2">We require all third-party processors to maintain appropriate data protection standards.</p>
            </Section>

            <Section title="6. Cookies & Tracking">
              We use only essential session cookies required for authentication. We do not use advertising cookies or third-party trackers. You can disable cookies in your browser but this may affect core functionality.
            </Section>

            <Section title="7. Data Retention">
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Active account data: retained while your account is open</li>
                <li>Files: deleted within 30 days of account deletion</li>
                <li>Access logs: retained for up to 90 days for security</li>
                <li>Billing records: retained for up to 7 years for legal compliance</li>
              </ul>
            </Section>

            <Section title="8. Your Rights">
              Depending on your location, you may have the right to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Access, correct, or delete your personal data</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent where processing is consent-based</li>
                <li>Lodge a complaint with a data protection authority</li>
              </ul>
              <p className="mt-2">To exercise these rights, <Link to="/contact" className="text-primary hover:underline">contact us</Link>.</p>
            </Section>

            <Section title="9. Children's Privacy">
              The Service is not directed to children under 13 (or under 16 in the EU). We do not knowingly collect personal data from children. If you believe a child has provided us data, contact us and we will delete it promptly.
            </Section>

            <Section title="10. Changes to This Policy">
              We may update this Privacy Policy from time to time. We will notify registered users by email of material changes and update the "Last updated" date. Continued use of the Service after changes constitutes acceptance.
            </Section>

            <Section title="11. Contact">
              For privacy concerns or data requests, <Link to="/contact" className="text-primary hover:underline">contact us here</Link>.
            </Section>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mb-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
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
