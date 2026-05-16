import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDate } from "@/lib/format";
import { Trash2 } from "lucide-react";

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [files, setFiles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { if (!loading && !isAdmin) nav("/app"); }, [loading, isAdmin, nav]);

  useEffect(() => { (async () => {
    if (!isAdmin) return;
    const [{ data: f }, { data: p }] = await Promise.all([
      supabase.from("files").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setFiles(f ?? []); setUsers(p ?? []);
  })(); }, [isAdmin]);

  async function delFile(id: string) {
    if (!confirm("Delete file?")) return;
    await supabase.functions.invoke("r2-delete", { body: { fileId: id } });
    setFiles(files.filter((f) => f.id !== id));
  }

  if (loading || !isAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground mt-1">Manage users and audit content.</p>
      </div>

      <Card className="glass border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 font-semibold">Users ({users.length})</div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground"><tr>
            <th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">ID</th><th className="px-4 py-2 text-left">Joined</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border/30">
                <td className="px-4 py-2">{u.display_name ?? "—"}</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{u.id.slice(0, 8)}…</td>
                <td className="px-4 py-2 text-muted-foreground">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="glass border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 font-semibold">Recent files ({files.length})</div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground"><tr>
            <th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">Size</th><th className="px-4 py-2 text-left">Visibility</th><th className="px-4 py-2 text-left">Owner</th><th></th>
          </tr></thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} className="border-t border-border/30">
                <td className="px-4 py-2 truncate max-w-xs">{f.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{formatBytes(f.size_bytes)}</td>
                <td className="px-4 py-2">{f.visibility}</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{f.user_id.slice(0,8)}…</td>
                <td className="px-4 py-2 text-right"><Button variant="ghost" size="sm" onClick={() => delFile(f.id)}><Trash2 className="size-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
