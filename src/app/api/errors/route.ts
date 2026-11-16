import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = JSON.parse(await req.text());
    if (!body?.message) return new Response(null, { status: 400 });
    await db.errorLog.create({
      data: {
        message: String(body.message).slice(0, 1000),
        stack: body.stack ? String(body.stack).slice(0, 4000) : null,
        path: body.path ? String(body.path).slice(0, 300) : null,
        source: "client",
      },
    });
  } catch {
    /* ignore */
  }
  return new Response(null, { status: 204 });
}
