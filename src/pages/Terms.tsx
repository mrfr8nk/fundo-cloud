import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logo from "/fundo-logo.png";

const LAST_UPDATED = "June 6, 2025";

export default function Terms() {
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
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">

            <Section title="1. Acceptance of Terms">
              By accessing or using Fundo CDN ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you may not use the Service. Fundo CDN is operated by Developer Darrell Mucheri ("we", "us", or "our"). These Terms constitute the entire agreement between you and Fundo CDN regarding your use of the Service.
            </Section>

            <Section title="2. Description of Service">
              Fundo CDN provides cloud-based file hosting, content delivery, and related developer tools including presigned uploads, signed URLs, API key management, and analytics. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
            </Section>

            <Section title="3. Account Registration">
              <p>You must create an account to access most features. You agree to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Provide accurate, complete, and current information</li>
                <li>Keep your credentials secure and not share them</li>
                <li>Notify us immediately of any unauthorized account access</li>
                <li>Be at least 13 years of age (or the minimum age in your jurisdiction)</li>
              </ul>
              <p className="mt-2">You are responsible for all activity under your account.</p>
            </Section>

            <Section title="4. Acceptable Use">
              <p>You agree NOT to use the Service to upload, store, or distribute:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Content that is illegal, obscene, defamatory, or harmful</li>
                <li>Malware, viruses, or any malicious executables</li>
                <li>Content that infringes any intellectual property rights</li>
                <li>Spam, phishing materials, or fraudulent content</li>
                <li>Content that violates any applicable law or regulation</li>
              </ul>
              <p className="mt-2">We reserve the right to remove any content and suspend accounts that violate this policy without prior notice.</p>
            </Section>

            <Section title="5. Storage Quotas & Fair Use">
              Each account tier includes defined storage and bandwidth limits. Exceeding these limits may result in throttling, overage charges, or service suspension. You agree not to use the Service in ways that unreasonably burden our infrastructure.
            </Section>

            <Section title="6. API Keys & Security">
              API keys ("fundo_live_*") grant programmatic access to your account. You are solely responsible for securing your API keys. Do not embed keys in client-side code or public repositories. We reserve the right to revoke keys that appear compromised.
            </Section>

            <Section title="7. Intellectual Property">
              <p><strong className="text-foreground">Your Content:</strong> You retain all ownership of content you upload. By uploading, you grant Fundo CDN a limited licence to store, cache, and deliver your content solely for the purpose of providing the Service.</p>
              <p className="mt-2"><strong className="text-foreground">Our IP:</strong> The Fundo CDN name, logo, and platform are trademarks of Developer Darrell Mucheri. You may not use them without prior written permission.</p>
            </Section>

            <Section title="8. Termination">
              You may delete your account at any time from the dashboard. We may suspend or terminate your account for violations of these Terms, non-payment, or at our discretion with 30 days' notice for non-violation terminations. Upon termination, your files will be deleted within 30 days.
            </Section>

            <Section title="9. Disclaimer of Warranties">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE SERVICE.
            </Section>

            <Section title="10. Limitation of Liability">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FUNDO CDN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF DATA OR PROFITS, ARISING FROM YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </Section>

            <Section title="11. Governing Law">
              These Terms are governed by the laws of Zimbabwe, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Harare, Zimbabwe.
            </Section>

            <Section title="12. Changes to Terms">
              We may update these Terms from time to time. We will notify registered users by email and update the "Last updated" date above. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </Section>

            <Section title="13. Contact">
              For questions about these Terms, contact us at <Link to="/contact" className="text-primary hover:underline">our contact page</Link>.
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
