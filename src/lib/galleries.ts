/** Estilos de galeria de fotos que o organizador pode escolher (independente do tema). */
export const GALLERIES: Record<string, { id: string; label: string; emoji: string; description: string }> = {
  grade: { id: "grade", label: "Grade", emoji: "▦", description: "Fotos quadradas lado a lado, simples e limpo." },
  polaroid: { id: "polaroid", label: "Polaroid", emoji: "📷", description: "Fotos com moldura branca, levemente inclinadas." },
  mosaico: { id: "mosaico", label: "Mosaico", emoji: "🧩", description: "Fotos em alturas diferentes, sem cortar." },
  carrossel: { id: "carrossel", label: "Carrossel", emoji: "↔️", description: "Uma faixa que desliza de lado, ótima no celular." },
};
