// Confirm upload completed; verify object exists and update size
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

    const { fileId } = z.object({ fileId: z.string().uuid() }).parse(await req.json());
    const { data: row } = await supabase.from("files").select("*").eq("id", fileId).eq("user_id", user.id).maybeSingle();
    if (!row) return json({ error: "not found" }, 404);

    const aws = new AwsClient({
      accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
      secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
      service: "s3", region: "auto",
    });
    const url = `https://${Deno.env.get("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${Deno.env.get("R2_BUCKET")}/${row.r2_key}`;
    const head = await aws.fetch(url, { method: "HEAD" });
    if (!head.ok) {
      await supabase.from("files").delete().eq("id", fileId);
      return json({ error: "object missing" }, 400);
    }
    const size = Number(head.headers.get("content-length") || row.size_bytes);
    await supabase.from("files").update({ size_bytes: size }).eq("id", fileId);
    await supabase.from("usage_logs").insert({ user_id: user.id, action: "upload", bytes: size, file_id: fileId });

    return json({ ok: true, size });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
