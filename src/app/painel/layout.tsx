import Link from "next/link";
import { requireUser, isSuperAdmin } from "@/lib/auth";
import { logout } from "../(auth)/actions";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/painel" className="font-fun text-xl font-bold text-pink-600">niverr 🎂</Link>
          <div className="flex items-center gap-3 text-sm">
            {isSuperAdmin(user.email) && (
              <Link href="/admin" className="font-semibold text-violet-700">Admin</Link>
            )}
            <span className="hidden text-zinc-500 sm:inline">{user.name}</span>
            <form action={logout}>
              <button className="text-zinc-500 hover:text-zinc-900">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
