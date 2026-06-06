import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { formatBytes } from "@/lib/format";
import { Files as FilesIcon, HardDrive, KeyRound, Activity } from "lucide-react";

export default function Overview() {
  const [stats, setStats] = useState({ files: 0, storage: 0, keys: 0, requests: 0, quota: 0 });

  useEffect(() => {
    api.get("/analytics/overview")
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Files", value: stats.files.toLocaleString(), icon: FilesIcon },
    {
      label: "Storage used", value: formatBytes(stats.storage), icon: HardDrive,
      sub: stats.quota ? `of ${formatBytes(stats.quota)}` : undefined,
      pct: stats.quota ? Math.min(100, (stats.storage / stats.quota) * 100) : 0,
    },
    { label: "Active API keys", value: stats.keys, icon: KeyRound },
    { label: "Requests (30d)", value: stats.requests.toLocaleString(), icon: Activity },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Your CDN at a glance.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="glass p-5 border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className="size-4 text-primary" />
            </div>
            <div className="mt-3 text-2xl font-bold">{c.value}</div>
            {c.sub && <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>}
            {typeof c.pct === "number" && c.pct > 0 && (
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${c.pct}%` }} />
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="glass p-6 border-border/50">
        <h2 className="font-semibold">Get started</h2>
        <ol className="mt-3 text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Upload your first file in <a href="/app/files" className="text-primary hover:underline">Files</a>.</li>
          <li>Generate an API key in <a href="/app/keys" className="text-primary hover:underline">API Keys</a>.</li>
          <li>Copy a code sample from <a href="/app/docs" className="text-primary hover:underline">API Docs</a> and start building.</li>
        </ol>
      </Card>
    </div>
  );
}
