// Public API: upload a file with API key auth (multipart)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX = 100 * 1024 * 1024;
const FORBIDDEN = /\.(exe|bat|cmd|sh|msi|dll)$/i;

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function authKey(req: Request, supabase: any) {
  const h = req.headers.get("Authorization") ?? "";
  const m = h.match(/^Bearer\s+(fundo_live_[a-z0-9]+)$/i);
  if (!m) return null;
  const hash = await sha256Hex(m[1]);
  const { data } = await supabase.from("api_keys").select("id, user_id, revoked_at").eq("key_hash", hash).maybeSingle();
  if (!data || data.revoked_at) return null;
  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return { keyId: data.id as string, userId: data.user_id as string };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const a = await authKey(req, supabase);
  if (!a) return json({ error: "invalid api key" }, 401);

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ error: "file field required" }, 400);
    if (file.size > MAX) return json({ error: "file too large (max 100MB)" }, 413);
    if (FORBIDDEN.test(file.name)) return json({ error: "file type not allowed" }, 400);

    const visibility = (form.get("visibility")?.toString() ?? "private") === "public" ? "public" : "private";
    const mime = file.type || "application/octet-stream";
    const folder = mime.startsWith("image/") ? "images" : mime.startsWith("video/") ? "videos" : "docs";
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${a.userId}/${folder}/${crypto.randomUUID()}-${safe}`;

    const aws = new AwsClient({
      accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
      secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
      service: "s3", region: "auto",
    });
    const url = `https://${Deno.env.get("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${Deno.env.get("R2_BUCKET")}/${key}`;
    const buf = new Uint8Array(await file.arrayBuffer());
    const r = await aws.fetch(url, { method: "PUT", body: buf, headers: { "Content-Type": mime } });
    if (!r.ok) return json({ error: `r2 upload ${r.status}` }, 502);

    const { data: row, error } = await supabase.from("files").insert({
      user_id: a.userId, name: file.name, r2_key: key, mime_type: mime,
      size_bytes: file.size, visibility, folder: `/${folder}`,
    }).select("id, name, mime_type, size_bytes, visibility, created_at").single();
    if (error) return json({ error: error.message }, 500);

    await supabase.from("usage_logs").insert({
      user_id: a.userId, api_key_id: a.keyId, action: "upload", bytes: file.size, file_id: row.id,
    });

    const publicBase = Deno.env.get("R2_PUBLIC_BASE_URL") ?? "";
    return json({
      id: row.id, name: row.name, size: row.size_bytes, mime: row.mime_type,
      visibility: row.visibility, created_at: row.created_at,
      url: visibility === "public" && publicBase ? `${publicBase.replace(/\/$/, "")}/${key}` : null,
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
