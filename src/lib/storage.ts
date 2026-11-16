import { put, del } from "@vercel/blob";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const MAX = 4 * 1024 * 1024;

export async function saveImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error("Arquivo precisa ser uma imagem");
  if (file.size > MAX) throw new Error("Imagem muito grande (máx 4MB)");
  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const name = `${folder}/${nanoid(12)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, file, { access: "public" });
    return blob.url;
  }
  // desenvolvimento local: salva em public/uploads
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function removeImage(url: string) {
  try {
    if (url.startsWith("/uploads/")) await unlink(path.join(process.cwd(), "public", url));
    else if (process.env.BLOB_READ_WRITE_TOKEN) await del(url);
  } catch {
    /* ignore */
  }
}
