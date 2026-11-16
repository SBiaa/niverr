import { get } from "@vercel/blob";

// Serve imagens do Blob store privado. Os nomes são aleatórios (nanoid), então
// só quem tem o link do convite chega até elas.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.map(decodeURIComponent).join("/");
  if (!pathname.startsWith("parties/") || pathname.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  const res = await get(pathname, { access: "private" }).catch(() => null);
  if (!res || res.statusCode !== 200) return new Response("Not found", { status: 404 });
  return new Response(res.stream, {
    headers: {
      "Content-Type": res.blob.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
