import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
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

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([api.get("/admin/files"), api.get("/admin/users")])
      .then(([f, u]) => { setFiles(f); setUsers(u); })
      .catch(() => {});
  }, [isAdmin]);

  async function delFile(id: string) {
    if (!confirm("Delete file?")) return;
    await api.delete(`/admin/files/${id}`).catch(() => {});
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
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border/30">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${u.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="glass border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 font-semibold">Recent files ({files.length})</div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Size</th>
              <th className="px-4 py-2 text-left">Visibility</th>
              <th className="px-4 py-2 text-left">Uploaded</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} className="border-t border-border/30">
                <td className="px-4 py-2 truncate max-w-xs">{f.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{formatBytes(f.size_bytes)}</td>
                <td className="px-4 py-2">{f.visibility}</td>
                <td className="px-4 py-2 text-muted-foreground">{formatDate(f.created_at)}</td>
                <td className="px-4 py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => delFile(f.id)}><Trash2 className="size-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
