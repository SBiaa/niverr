import { THEMES, toLocalInput } from "@/lib/format";
import type { Party } from "@prisma/client";
import SubmitButton from "./SubmitButton";
import DesignPicker from "./DesignPicker";
import { GALLERIES } from "@/lib/galleries";

const COLORS = ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#c9a227", "#0f172a"];

export default function PartyForm({
  action,
  party,
  photos,
  submitLabel,
}: {
  action: (form: FormData) => Promise<void>;
  party?: Party;
  photos?: { id: string; url: string }[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="label">Nome do aniversariante *</label>
          <input name="honoreeName" className="input" required defaultValue={party?.honoreeName} placeholder="Ex: Isadora" />
        </div>
        <div>
          <label className="label">Idade que vai fazer</label>
          <input name="age" type="number" min={0} max={120} className="input" defaultValue={party?.age ?? ""} />
        </div>
      </div>

      <div>
        <label className="label">Tipo de festa</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(THEMES).map(([k, t]) => (
            <label key={k} className="cursor-pointer">
              <input type="radio" name="theme" value={k} defaultChecked={(party?.theme ?? "infantil") === k} className="peer sr-only" />
              <span className="inline-block rounded-full border border-zinc-200 bg-white px-4 py-2 peer-checked:border-pink-500 peer-checked:bg-pink-50">
                {t.emoji} {t.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <DesignPicker
        design={party?.design}
        palette={party?.palette}
        photos={photos}
        coverUrl={party?.coverUrl}
        profileUrl={party?.profileUrl}
      />

      <div>
        <label className="label">Estilo da galeria de fotos</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.values(GALLERIES).map((g) => (
            <label key={g.id} className="cursor-pointer">
              <input type="radio" name="gallery" value={g.id} defaultChecked={(party?.gallery ?? "grade") === g.id} className="peer sr-only" />
              <span className="block rounded-xl border border-zinc-200 bg-white px-3 py-2 peer-checked:border-pink-500 peer-checked:bg-pink-50">
                <b>{g.emoji} {g.label}</b>
                <span className="block text-xs text-zinc-500">{g.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Cor de destaque (botões, idade, balão)</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="color" value={c} defaultChecked={(party?.color ?? COLORS[0]) === c} className="peer sr-only" />
              <span className="block h-9 w-9 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-zinc-800" style={{ background: c }} />
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Data e horário *</label>
          <input name="date" type="datetime-local" className="input" required defaultValue={party ? toLocalInput(party.date) : ""} />
        </div>
        <div>
          <label className="label">Termina às (opcional)</label>
          <input name="endTime" type="time" className="input" defaultValue={party?.endTime ?? ""} />
        </div>
      </div>

      <div>
        <label className="label">Nome do local *</label>
        <input name="venueName" className="input" required defaultValue={party?.venueName} placeholder="Ex: Buffet Alegria" />
      </div>
      <div>
        <label className="label">Endereço completo *</label>
        <input name="address" className="input" required defaultValue={party?.address} placeholder="Rua, número, bairro, cidade" />
        <p className="mt-1 text-xs text-zinc-500">É esse endereço que vai abrir no Google Maps / Apple Maps.</p>
      </div>
      <div>
        <label className="label">Mensagem para os convidados</label>
        <textarea name="message" rows={3} className="input" defaultValue={party?.message ?? ""} placeholder="Ex: Venha comemorar comigo! Traje: fantasia de super-herói 🦸" />
      </div>
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
