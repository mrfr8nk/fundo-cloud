// Public API: list files (GET) or delete (POST { action:"delete", fileId })
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function authKey(req: Request, supabase: any) {
  const m = (req.headers.get("Authorization") ?? "").match(/^Bearer\s+(fundo_live_[a-z0-9]+)$/i);
  if (!m) return null;
  const hash = await sha256Hex(m[1]);
  const { data } = await supabase.from("api_keys").select("id, user_id, revoked_at").eq("key_hash", hash).maybeSingle();
  if (!data || data.revoked_at) return null;
  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return { keyId: data.id as string, userId: data.user_id as string };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const a = await authKey(req, supabase);
  if (!a) return json({ error: "invalid api key" }, 401);

  if (req.method === "GET") {
    const { data, error } = await supabase.from("files")
      .select("id, name, mime_type, size_bytes, visibility, created_at, r2_key")
      .eq("user_id", a.userId).order("created_at", { ascending: false }).limit(500);
    if (error) return json({ error: error.message }, 500);
    const publicBase = Deno.env.get("R2_PUBLIC_BASE_URL") ?? "";
    return json({
      files: (data ?? []).map((f) => ({
        id: f.id, name: f.name, size: f.size_bytes, mime: f.mime_type,
        visibility: f.visibility, created_at: f.created_at,
        url: f.visibility === "public" && publicBase ? `${publicBase.replace(/\/$/, "")}/${f.r2_key}` : null,
      })),
    });
  }

  if (req.method === "POST") {
    let body: any;
    try { body = await req.json(); } catch { return json({ error: "json body required" }, 400); }
    if (body?.action === "delete" && typeof body.fileId === "string") {
      const { data: row } = await supabase.from("files").select("*").eq("id", body.fileId).eq("user_id", a.userId).maybeSingle();
      if (!row) return json({ error: "not found" }, 404);
      const aws = new AwsClient({
        accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
        secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
        service: "s3", region: "auto",
      });
      await aws.fetch(`https://${Deno.env.get("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${Deno.env.get("R2_BUCKET")}/${row.r2_key}`, { method: "DELETE" });
      await supabase.from("files").delete().eq("id", row.id);
      await supabase.from("usage_logs").insert({ user_id: a.userId, api_key_id: a.keyId, action: "delete", bytes: 0, file_id: row.id });
      return json({ ok: true });
    }
    return json({ error: "unknown action" }, 400);
  }

  return json({ error: "method not allowed" }, 405);
});

function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
