// Presigned PUT URL for direct R2 upload
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const Body = z.object({
  filename: z.string().min(1).max(255),
  mime: z.string().min(1).max(255),
  size: z.number().int().min(1).max(100 * 1024 * 1024),
});

const FORBIDDEN = /\.(exe|bat|cmd|sh|msi|dll)$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
    const { filename, mime, size } = parsed.data;
    if (FORBIDDEN.test(filename)) return json({ error: "file type not allowed" }, 400);

    const folder = mime.startsWith("image/") ? "images" : mime.startsWith("video/") ? "videos" : "docs";
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${user.id}/${folder}/${crypto.randomUUID()}-${safe}`;

    // Insert file row first (size will be confirmed later)
    const { data: row, error: insErr } = await supabase
      .from("files")
      .insert({ user_id: user.id, name: filename, r2_key: key, mime_type: mime, size_bytes: size, folder: `/${folder}` })
      .select("id").single();
    if (insErr) return json({ error: insErr.message }, 500);

    // Sign presigned PUT
    const ACCOUNT = Deno.env.get("R2_ACCOUNT_ID")!;
    const BUCKET = Deno.env.get("R2_BUCKET")!;
    const aws = new AwsClient({
      accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
      secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
      service: "s3",
      region: "auto",
    });
    const url = `https://${ACCOUNT}.r2.cloudflarestorage.com/${BUCKET}/${key}?X-Amz-Expires=900`;
    const signed = await aws.sign(new Request(url, { method: "PUT", headers: { "Content-Type": mime } }), {
      aws: { signQuery: true },
    });

    return json({ url: signed.url, fileId: row.id, key });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
