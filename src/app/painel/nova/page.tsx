import PartyForm from "@/components/PartyForm";
import { createParty } from "../actions";

export default function NovaFesta() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Nova festa 🎉</h1>
      <PartyForm action={createParty} submitLabel="Criar festa" />
    </div>
  );
}
