// Generate signed GET URL for private file
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const { fileId, expiresIn } = z.object({
      fileId: z.string().uuid(),
      expiresIn: z.number().int().min(60).max(86400).default(3600),
    }).parse(await req.json());

    const { data: row } = await supabase.from("files").select("*").eq("id", fileId).maybeSingle();
    if (!row) return json({ error: "not found" }, 404);

    const aws = new AwsClient({
      accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
      secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
      service: "s3", region: "auto",
    });
    const url = `https://${Deno.env.get("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${Deno.env.get("R2_BUCKET")}/${row.r2_key}?X-Amz-Expires=${expiresIn}`;
    const signed = await aws.sign(new Request(url), { aws: { signQuery: true } });

    await supabase.from("usage_logs").insert({ user_id: user.id, action: "download", bytes: row.size_bytes, file_id: fileId });
    return json({ url: signed.url, expiresIn });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
