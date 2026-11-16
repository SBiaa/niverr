/** Cena do recife (água em degradê, raios de luz, peixes, bolhas, corais e fundo do mar), colorida pela paleta. */
const RAYS = ["175,0 201,0 285,827 197,827", "290,0 316,0 412,827 327,827", "289,0 322,0 348,827 238,827", "244,0 262,0 321,827 263,827"];
const RAY_OP = [0.85, 0.54, 0.92, 0.79];
const FISH: [number, number, number, number][] = [[204, 212, 1, 20], [124, 483, -1, 15], [204, 275, -1, 18], [327, 591, 1, 19], [285, 309, 1, 16]];
const BUBBLES: [number, number, number][] = [
  [201, 777, 9.5], [146, 608, 9], [165, 53, 8.5], [70, 505, 10.5], [19, 513, 8], [341, 351, 8], [71, 92, 7.7], [319, 756, 8],
  [265, 52, 3.2], [277, 742, 5.3], [191, 669, 8.4], [52, 133, 10.8], [20, 697, 10.9], [97, 778, 4.5], [29, 82, 10.7], [292, 315, 7.5],
];
// [x, altura, cor (chave da paleta), espessura]
const CORALS: [number, number, string, number][] = [
  [12, 71, "coral1", 9], [31, 51, "coral2", 9], [55, 63, "coral1", 9], [78, 73, "coral1", 9],
  [312, 65, "coral1", 9], [335, 85, "coral3", 9], [359, 101, "coral3", 9], [378, 93, "coral3", 9],
  [148, 31, "coral3", 7], [195, 42, "coral2", 7], [242, 54, "coral2", 7],
];

export default function SeaScene({
  palette,
  idPrefix = "sea",
  className,
}: {
  palette: Record<string, string>;
  idPrefix?: string;
  className?: string;
}) {
  const p = palette;
  return (
    <svg aria-hidden="true" viewBox="0 0 390 940" preserveAspectRatio="xMidYMax slice" className={className}>
      <defs>
        <linearGradient id={`${idPrefix}-w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.waterTop} />
          <stop offset=".28" stopColor={p.waterUpper} />
          <stop offset=".5" stopColor={p.waterMid} />
          <stop offset=".78" stopColor={p.waterDeep} />
          <stop offset="1" stopColor={p.seabed} />
        </linearGradient>
        <linearGradient id={`${idPrefix}-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.rays} stopOpacity=".42" />
          <stop offset="1" stopColor={p.rays} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="390" height="940" fill={`url(#${idPrefix}-w)`} />
      {RAYS.map((pts, i) => (
        <polygon key={i} points={pts} fill={`url(#${idPrefix}-r)`} opacity={RAY_OP[i]} />
      ))}
      {FISH.map(([x, y, dir, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${dir} 1)`} fill={p.rays} opacity={0.18 + (i % 3) * 0.04}>
          <ellipse cx="0" cy="0" rx={s} ry={s / 2} />
          <path d={`M${s * 0.8} 0 L${s * 1.6} ${-s / 2} L${s * 1.6} ${s / 2}Z`} />
          <circle cx={-s / 2} cy={-s / 10} r={s / 9} fill={p.seabed} />
        </g>
      ))}
      {BUBBLES.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={p.rays} strokeWidth="1.5" opacity={0.3 + (i % 4) * 0.08} />
      ))}
      <g opacity=".55" strokeLinecap="round" fill="none">
        {CORALS.map(([x, h, key, w], i) => (
          <g key={i} stroke={p[key]} strokeWidth={w}>
            <path d={`M${x} 884 L${x} ${884 - h}`} />
            <path d={`M${x} ${884 - h * 0.45} Q ${x - 14} ${884 - h * 0.55}, ${x - 20} ${884 - h * 0.8}`} />
            <path d={`M${x} ${884 - h * 0.62} Q ${x + 14} ${884 - h * 0.72}, ${x + 18} ${884 - h * 0.95}`} />
          </g>
        ))}
      </g>
      {[8, 23, 43, 347, 367, 386].map((x, i) => (
        <path
          key={i}
          d={`M${x} 950 C ${x - 26} 920, ${x + 26} 890, ${x} 860 S ${x - 22} 835, ${x + 4} 825`}
          stroke={p.seabed}
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <path d="M0 898 Q 117 860, 215 898 T 390 884 L390 940 L0 940Z" fill={p.seabed} />
    </svg>
  );
}
