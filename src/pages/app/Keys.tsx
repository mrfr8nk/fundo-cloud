import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, KeyRound, Trash2, Plus } from "lucide-react";
import { formatDate } from "@/lib/format";

type K = { id: string; name: string; key_prefix: string; last_used_at: string | null; revoked_at: string | null; created_at: string };

export default function Keys() {
  const [keys, setKeys] = useState<K[]>([]);
  const [name, setName] = useState("");
  const [shown, setShown] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
    setKeys((data ?? []) as K[]);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!name.trim()) return toast.error("Name required");
    const { data, error } = await supabase.functions.invoke("key-mint", { body: { name } });
    if (error || !data?.key) return toast.error(error?.message || "Failed");
    setShown(data.key);
    setName("");
    load();
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this key?")) return;
    await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground mt-1">Authenticate API requests. Revoke any time.</p>
      </div>

      <Card className="glass p-6 border-border/50">
        <div className="flex gap-2">
          <Input placeholder="Key name (e.g. production)" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={create} className="bg-primary text-primary-foreground"><Plus className="size-4 mr-1" /> Generate</Button>
        </div>
        {shown && (
          <div className="mt-4 p-4 rounded-lg neon-border bg-background/40">
            <div className="text-xs text-muted-foreground mb-2">Copy now — you won't see this again.</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm break-all">{shown}</code>
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(shown); toast.success("Copied"); }}>
                <Copy className="size-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShown(null)}>Done</Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="glass border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground border-b border-border/50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Key</th>
              <th className="px-4 py-3 text-left">Last used</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-b border-border/30">
                <td className="px-4 py-3 flex items-center gap-2"><KeyRound className="size-4 text-primary" /> {k.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{k.key_prefix}…</td>
                <td className="px-4 py-3 text-muted-foreground">{k.last_used_at ? formatDate(k.last_used_at) : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(k.created_at)}</td>
                <td className="px-4 py-3">
                  {k.revoked_at
                    ? <span className="text-xs px-2 py-0.5 rounded bg-destructive/20 text-destructive">revoked</span>
                    : <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">active</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  {!k.revoked_at && <Button variant="ghost" size="sm" onClick={() => revoke(k.id)}><Trash2 className="size-4" /></Button>}
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No keys yet.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
