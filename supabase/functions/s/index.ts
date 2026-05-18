// Short-link redirect: /s/:slug -> public R2 URL or signed URL
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  // Path can be /s/{slug} or /functions/v1/s/{slug}
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = parts[parts.length - 1];
  if (!slug || slug === "s") return new Response("missing slug", { status: 400 });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: file } = await supabase
    .from("files")
    .select("id, user_id, r2_key, visibility, size_bytes")
    .eq("short_slug", slug)
    .maybeSingle();

  if (!file) return new Response("not found", { status: 404 });

  let target: string;
  if (file.visibility === "public") {
    const base = (Deno.env.get("R2_PUBLIC_BASE_URL") ?? "").replace(/\/$/, "");
    target = `${base}/${file.r2_key}`;
  } else {
    const aws = new AwsClient({
      accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
      secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
      service: "s3", region: "auto",
    });
    const r2 = `https://${Deno.env.get("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${Deno.env.get("R2_BUCKET")}/${file.r2_key}?X-Amz-Expires=3600`;
    const signed = await aws.sign(new Request(r2), { aws: { signQuery: true } });
    target = signed.url;
  }

  await supabase.from("files").update({ download_count: 1 }).eq("id", file.id);
  await supabase.from("usage_logs").insert({
    user_id: file.user_id, action: "download", bytes: file.size_bytes, file_id: file.id,
  });

  return Response.redirect(target, 302);
});
