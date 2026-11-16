import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ProfileForm, PasswordForm } from "./AccountForms";

export default async function ContaPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link href="/painel" className="text-sm text-zinc-500 hover:text-zinc-900">← Minhas festas</Link>
        <h1 className="mt-2 text-2xl font-bold">Minha conta</h1>
      </div>
      <ProfileForm name={user.name} email={user.email} />
      <PasswordForm />
    </div>
  );
}
