import Link from "next/link";
import { getUser } from "@/lib/auth";
import { track } from "@/lib/track";

export default async function Home() {
  const user = await getUser();
  await track({ path: "/", kind: "page", userId: user?.id });
  return (
    <main className="bg-confetti min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <span className="font-fun text-2xl font-bold text-pink-600">niverr 🎂</span>
        <Link href={user ? "/painel" : "/entrar"} className="btn-ghost text-sm">
          {user ? "Meu painel" : "Entrar"}
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-16 pt-10 text-center">
        <h1 className="font-fun text-4xl font-bold leading-tight sm:text-6xl">
          O convite do aniversário <span className="text-pink-600">direto no WhatsApp</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-600">
          Monte o convite com fotos, local e horário. Envie um link personalizado pra cada convidado e
          veja em tempo real quem vai à festa.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/cadastro" className="btn-primary px-7 py-3 text-lg">Criar meu convite grátis</Link>
          <Link href="/entrar" className="btn-ghost px-7 py-3 text-lg">Já tenho conta</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-20 sm:grid-cols-3">
        {[
          ["💌", "Convite com o nome", "Cada convidado recebe um link só dele: “Olá, Maria! Você vem?”"],
          ["📍", "Como chegar", "Um toque abre o Google Maps ou o Apple Maps no celular do convidado."],
          ["✅", "Confirmação fácil", "Sem cadastro e sem SMS. O convidado só aperta “Sim, eu vou!”."],
          ["📸", "Fotos do aniversariante", "Uma galeria pra deixar o convite com a cara da festa."],
          ["🎁", "Lista de presentes", "O convidado escolhe o presente e ninguém repete."],
          ["📊", "Tudo no painel", "Quem abriu, quem confirmou, quantas pessoas no total."],
        ].map(([e, t, d]) => (
          <div key={t} className="card">
            <p className="text-3xl">{e}</p>
            <h3 className="mt-2 font-bold">{t}</h3>
            <p className="mt-1 text-sm text-zinc-600">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
