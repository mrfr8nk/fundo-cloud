import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatBytes, formatDate, classifyMime } from "@/lib/format";
import {
  Upload, Trash2, Link2, Search, Star, Image as ImageIcon, FileText, Film, Archive, File as FileIcon, Loader2,
} from "lucide-react";

const MAX = 100 * 1024 * 1024;
type Row = { id: string; name: string; r2_key: string; size_bytes: number; mime_type: string; visibility: string; favorite: boolean; created_at: string; tags: string[] };

function iconFor(mime: string) {
  const c = classifyMime(mime);
  return c === "image" ? ImageIcon : c === "video" ? Film : c === "pdf" || c === "doc" ? FileText : c === "archive" ? Archive : FileIcon;
}

export default function FilesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const { data } = await supabase.from("files").select("*").order("created_at", { ascending: false }).limit(500);
    setRows((data ?? []) as Row[]);
  }
  useEffect(() => { refresh(); }, []);

  const onFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    for (const f of arr) {
      if (f.size > MAX) { toast.error(`${f.name} exceeds 100MB`); continue; }
      const tempId = `${f.name}-${f.size}-${Date.now()}`;
      setProgress((p) => ({ ...p, [tempId]: 1 }));
      try {
        const { data: pres, error } = await supabase.functions.invoke("r2-presign-put", {
          body: { filename: f.name, mime: f.type || "application/octet-stream", size: f.size },
        });
        if (error || !pres?.url) throw new Error(error?.message || "presign failed");

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", pres.url);
          xhr.setRequestHeader("Content-Type", f.type || "application/octet-stream");
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress((p) => ({ ...p, [tempId]: Math.round((e.loaded / e.total) * 100) }));
          };
          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`upload ${xhr.status}`)));
          xhr.onerror = () => reject(new Error("upload failed"));
          xhr.send(f);
        });

        await supabase.functions.invoke("r2-confirm", { body: { fileId: pres.fileId } });
        toast.success(`Uploaded ${f.name}`);
      } catch (e: any) {
        toast.error(`${f.name}: ${e.message}`);
      } finally {
        setProgress((p) => { const { [tempId]: _, ...rest } = p; return rest; });
      }
    }
    refresh();
  }, []);

  function onDrop(e: React.DragEvent) { e.preventDefault(); setBusy(false); if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files); }

  async function del(ids: string[]) {
    if (!confirm(`Delete ${ids.length} file(s)?`)) return;
    for (const id of ids) {
      const { error } = await supabase.functions.invoke("r2-delete", { body: { fileId: id } });
      if (error) toast.error(error.message);
    }
    setSelected(new Set());
    refresh();
  }

  async function toggleFav(id: string, value: boolean) {
    await supabase.from("files").update({ favorite: !value }).eq("id", id);
    refresh();
  }

  async function shareLink(row: Row) {
    if (row.visibility === "public") {
      const url = `https://cdn.synapex.co.zw/${row.r2_key}`;
      await navigator.clipboard.writeText(url);
      toast.success("Public link copied");
    } else {
      const { data, error } = await supabase.functions.invoke("r2-sign-get", { body: { fileId: row.id, expiresIn: 3600 } });
      if (error || !data?.url) { toast.error("Failed to sign URL"); return; }
      await navigator.clipboard.writeText(data.url);
      toast.success("Signed URL copied (1h)");
    }
  }

  async function toggleVisibility(row: Row) {
    const next = row.visibility === "public" ? "private" : "public";
    await supabase.from("files").update({ visibility: next }).eq("id", row.id);
    refresh();
  }

  const filtered = rows.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.tags.some((t) => t.includes(q.toLowerCase())));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground mt-1">Drag, drop, deliver.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => del(Array.from(selected))}>
              <Trash2 className="size-4 mr-1.5" /> Delete {selected.size}
            </Button>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files…" className="pl-8 w-64" />
          </div>
        </div>
      </div>

      <Card
        onDragOver={(e) => { e.preventDefault(); setBusy(true); }}
        onDragLeave={() => setBusy(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`glass cursor-pointer p-10 border-dashed border-border/60 text-center transition ${busy ? "neon-border" : ""}`}
      >
        <input ref={inputRef} type="file" multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />
        <Upload className="size-8 mx-auto text-primary" />
        <div className="mt-3 font-medium">Drop files here or click to browse</div>
        <div className="text-sm text-muted-foreground mt-1">Up to 100 MB each · images, video, PDF, archives</div>
      </Card>

      {Object.entries(progress).map(([k, v]) => (
        <div key={k} className="glass rounded-lg p-3 flex items-center gap-3">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span className="text-sm flex-1 truncate">{k.split("-")[0]}</span>
          <div className="w-40 h-1.5 rounded bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${v}%` }} />
          </div>
          <span className="text-xs text-muted-foreground w-10 text-right">{v}%</span>
        </div>
      ))}

      <Card className="glass border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-border/50">
              <tr>
                <th className="px-4 py-3 text-left w-8"></th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Size</th>
                <th className="px-4 py-3 text-left">Visibility</th>
                <th className="px-4 py-3 text-left">Uploaded</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const Icon = iconFor(r.mime_type);
                return (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(r.id)} onChange={(e) => {
                        const ns = new Set(selected); e.target.checked ? ns.add(r.id) : ns.delete(r.id); setSelected(ns);
                      }} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-primary shrink-0" />
                        <span className="truncate max-w-xs">{r.name}</span>
                        <button onClick={() => toggleFav(r.id, r.favorite)}>
                          <Star className={`size-4 ${r.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatBytes(r.size_bytes)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleVisibility(r)} className={`text-xs px-2 py-0.5 rounded ${r.visibility === "public" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {r.visibility}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => shareLink(r)}><Link2 className="size-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => del([r.id])}><Trash2 className="size-4" /></Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No files yet. Drag one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
