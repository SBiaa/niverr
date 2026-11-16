import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-confetti flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <p className="text-6xl">🎈</p>
        <h1 className="mt-4 text-2xl font-bold">Convite não encontrado</h1>
        <p className="mt-2 text-zinc-600">O link pode estar incompleto ou ter sido trocado pelo organizador.</p>
        <Link href="/" className="btn-primary mt-6">Ir para o início</Link>
      </div>
    </main>
  );
}
