export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function classifyMime(mime: string): "image" | "video" | "pdf" | "doc" | "archive" | "other" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("zip") || mime.includes("compressed") || mime.includes("tar")) return "archive";
  if (mime.includes("word") || mime.includes("excel") || mime.includes("sheet") || mime.includes("text/")) return "doc";
  return "other";
}
