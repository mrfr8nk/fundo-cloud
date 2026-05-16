import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/app/docs")({ component: Docs });

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const BASE = `https://${PROJECT_ID}.functions.supabase.co`;

const TABS = ["cURL", "JavaScript", "Python", "PHP"] as const;

const SAMPLES = {
  upload: {
    "cURL": `curl -X POST ${BASE}/api-upload \\
  -H "Authorization: Bearer fundo_live_xxx" \\
  -F "file=@./logo.png"`,
    "JavaScript": `const form = new FormData();
form.append("file", fileBlob, "logo.png");

const res = await fetch("${BASE}/api-upload", {
  method: "POST",
  headers: { Authorization: "Bearer fundo_live_xxx" },
  body: form,
});
const data = await res.json();
console.log(data.url);`,
    "Python": `import requests

with open("logo.png", "rb") as f:
    r = requests.post(
        "${BASE}/api-upload",
        headers={"Authorization": "Bearer fundo_live_xxx"},
        files={"file": f},
    )
print(r.json())`,
    "PHP": `<?php
$ch = curl_init("${BASE}/api-upload");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer fundo_live_xxx"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, ["file" => new CURLFile("logo.png")]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
echo curl_exec($ch);`,
  },
  list: {
    "cURL": `curl ${BASE}/api-files \\
  -H "Authorization: Bearer fundo_live_xxx"`,
    "JavaScript": `const res = await fetch("${BASE}/api-files", {
  headers: { Authorization: "Bearer fundo_live_xxx" },
});
console.log(await res.json());`,
    "Python": `import requests
print(requests.get("${BASE}/api-files",
  headers={"Authorization": "Bearer fundo_live_xxx"}).json())`,
    "PHP": `<?php
$ctx = stream_context_create(["http" => ["header" => "Authorization: Bearer fundo_live_xxx"]]);
echo file_get_contents("${BASE}/api-files", false, $ctx);`,
  },
  del: {
    "cURL": `curl -X POST ${BASE}/api-files \\
  -H "Authorization: Bearer fundo_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"action":"delete","fileId":"<file-id>"}'`,
    "JavaScript": `await fetch("${BASE}/api-files", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer fundo_live_xxx" },
  body: JSON.stringify({ action: "delete", fileId: "<file-id>" }),
});`,
    "Python": `import requests
requests.post("${BASE}/api-files",
  headers={"Authorization": "Bearer fundo_live_xxx"},
  json={"action": "delete", "fileId": "<file-id>"})`,
    "PHP": `<?php
// Use cURL with JSON body — see upload sample for cURL setup.`,
  },
} as const;

function Block({ samples, label }: { samples: Record<string, string>; label: string }) {
  const [tab, setTab] = useState<typeof TABS[number]>("cURL");
  return (
    <Card className="glass border-border/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`text-xs px-2.5 py-1 rounded ${tab === t ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(samples[tab]); toast.success("Copied"); }}>
            <Copy className="size-3.5" />
          </Button>
        </div>
      </div>
      <pre className="p-4 text-xs overflow-x-auto font-mono leading-relaxed">{samples[tab]}</pre>
    </Card>
  );
}

function Docs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Docs</h1>
        <p className="text-muted-foreground mt-1">Production REST API. Bring your own client.</p>
      </div>

      <Card className="glass p-6 border-border/50">
        <h2 className="font-semibold">Authentication</h2>
        <p className="text-sm text-muted-foreground mt-2">All API requests require a Bearer token from the API Keys page.</p>
        <pre className="mt-3 text-xs bg-background/40 rounded-lg p-3 font-mono">Authorization: Bearer fundo_live_xxx</pre>
      </Card>

      <div>
        <h3 className="font-semibold mb-2">Upload a file</h3>
        <p className="text-sm text-muted-foreground mb-3">POST <code className="text-primary">/api-upload</code> · multipart/form-data with <code>file</code> field. Max 100 MB.</p>
        <Block samples={SAMPLES.upload} label="POST /api-upload" />
      </div>

      <div>
        <h3 className="font-semibold mb-2">List files</h3>
        <p className="text-sm text-muted-foreground mb-3">GET <code className="text-primary">/api-files</code></p>
        <Block samples={SAMPLES.list} label="GET /api-files" />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Delete a file</h3>
        <p className="text-sm text-muted-foreground mb-3">POST <code className="text-primary">/api-files</code> with <code>{`{ action: "delete", fileId }`}</code></p>
        <Block samples={SAMPLES.del} label="POST /api-files" />
      </div>

      <Card className="glass p-6 border-border/50">
        <h2 className="font-semibold">Response shape</h2>
        <pre className="mt-3 text-xs bg-background/40 rounded-lg p-3 font-mono overflow-x-auto">{`{
  "id": "uuid",
  "name": "logo.png",
  "size": 12345,
  "mime": "image/png",
  "url": "https://cdn.synapex.co.zw/<key>",
  "visibility": "private",
  "created_at": "2025-01-01T00:00:00Z"
}`}</pre>
      </Card>
    </div>
  );
}
