"use client";
import { useActionState, useRef, useEffect, useState } from "react";
import { updateProfile, updatePassword } from "./actions";

function Msg({ s }: { s?: { ok?: string; error?: string } }) {
  if (s?.error) return <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{s.error}</p>;
  if (s?.ok) return <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">✅ {s.ok}</p>;
  return null;
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [mail, setMail] = useState(email);
  return (
    <form action={action} className="card space-y-4 p-5">
      <h2 className="text-lg font-bold">Seus dados</h2>
      <div>
        <label className="label">Nome</label>
        <input name="name" defaultValue={name} className="input" required />
      </div>
      <div>
        <label className="label">E-mail (usado para entrar)</label>
        <input name="email" type="email" value={mail} onChange={(e) => setMail(e.target.value)} className="input" required />
      </div>
      {mail.trim().toLowerCase() !== email.toLowerCase() && (
        <div>
          <label className="label">Confirme sua senha atual para trocar o e-mail</label>
          <input name="currentPassword" type="password" className="input" required autoComplete="current-password" />
        </div>
      )}
      <Msg s={state} />
      <button className="btn-primary" disabled={pending}>{pending ? "Salvando..." : "Salvar dados"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="card space-y-4 p-5">
      <h2 className="text-lg font-bold">Trocar senha</h2>
      <div>
        <label className="label">Senha atual</label>
        <input name="current" type="password" className="input" required autoComplete="current-password" />
      </div>
      <div>
        <label className="label">Nova senha</label>
        <input name="next" type="password" minLength={6} className="input" required autoComplete="new-password" />
      </div>
      <div>
        <label className="label">Repita a nova senha</label>
        <input name="confirm" type="password" minLength={6} className="input" required autoComplete="new-password" />
      </div>
      <Msg s={state} />
      <button className="btn-primary" disabled={pending}>{pending ? "Salvando..." : "Trocar senha"}</button>
    </form>
  );
}
