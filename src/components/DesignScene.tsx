import ForestScene from "@/components/ForestScene";
import SeaScene from "@/components/SeaScene";
import FarmScene from "@/components/FarmScene";
import { DESIGNS } from "@/lib/designs";

/** Desenha a cena do tema escolhido (ou nada, para o tema clássico). */
export default function DesignScene({
  design,
  palette,
  idPrefix,
  className,
}: {
  design: string;
  palette: Record<string, string>;
  idPrefix?: string;
  className?: string;
}) {
  const scene = DESIGNS[design]?.scene;
  if (scene === "forest") return <ForestScene palette={palette} idPrefix={idPrefix} className={className} />;
  if (scene === "sea") return <SeaScene palette={palette} idPrefix={idPrefix} className={className} />;
  if (scene === "farm") return <FarmScene palette={palette} idPrefix={idPrefix} className={className} />;
  return null;
}
