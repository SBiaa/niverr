/** Cena da fazendinha (céu, sol com raios, nuvens, colinas, celeiro, árvore, cerca e terra), colorida pela paleta. */
const RAYS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  const b = a + 0.14;
  const pt = (ang: number, r: number) => `${(195 + Math.cos(ang) * r).toFixed(0)},${(240 + Math.sin(ang) * r).toFixed(0)}`;
  return `${pt(a, 118)} ${pt(b, 118)} ${pt(a + 0.07, 330)}`;
});
const CLOUDS: [number, number, number][] = [[50, 420, 0.8], [340, 470, 0.9]];
const GRASS = Array.from({ length: 17 }, (_, i) => 10 + i * 24);
const POSTS = [8, 64, 120, 176, 232, 288, 344];

export default function FarmScene({
  palette,
  idPrefix = "farm",
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
        <linearGradient id={`${idPrefix}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset=".45" stopColor={p.skyMid} />
          <stop offset=".72" stopColor={p.skyBottom} />
        </linearGradient>
      </defs>
      <rect width="390" height="940" fill={`url(#${idPrefix}-sky)`} />
      {RAYS.map((pts, i) => (
        <polygon key={i} points={pts} fill={p.sunGlow} opacity=".3" />
      ))}
      <circle cx="195" cy="240" r="142" fill={p.sunGlow} opacity=".38" />
      <circle cx="195" cy="240" r="105" fill={p.sun} />
      {CLOUDS.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill={p.cloud} opacity=".94">
          <ellipse cx="0" cy="0" rx="46" ry="20" />
          <ellipse cx="-30" cy="6" rx="30" ry="16" />
          <ellipse cx="32" cy="8" rx="34" ry="15" />
          <circle cx="-8" cy="-14" r="20" />
          <circle cx="16" cy="-10" r="16" />
        </g>
      ))}
      <path d="M0 620 Q 98 564 195 620 T 390 602 L390 940 L0 940Z" fill={p.hillFar} />
      <path d="M0 705 Q 117 649 234 705 T 390 677 L390 940 L0 940Z" fill={p.hillMid} />
      {[728, 757, 785].map((y) => (
        <path key={y} d={`M0 ${y} Q 117 ${y - 57}, 234 ${y} T 390 ${y - 28}`} stroke={p.furrow} strokeWidth="3" fill="none" />
      ))}
      <g transform="translate(39 700) scale(0.8)">
        <rect x="-40" y="-40" width="80" height="40" fill={p.barn} />
        <polygon points="-46,-38 -30,-62 0,-72 30,-62 46,-38" fill={p.barnRoof} />
        <rect x="-14" y="-24" width="28" height="24" fill={p.barnRoof} stroke="#FFF8E7" strokeWidth="2.5" opacity=".85" />
        <path d="M-14 -24 L14 0 M14 -24 L-14 0" stroke="#FFF8E7" strokeWidth="2" />
      </g>
      <g transform="translate(359 705) scale(0.7)">
        <rect x="-5" y="-30" width="10" height="30" fill={p.fence} />
        <circle cx="0" cy="-48" r="26" fill={p.leaves} />
        <circle cx="-16" cy="-36" r="18" fill={p.leaves} />
        <circle cx="16" cy="-38" r="18" fill={p.leaves} />
      </g>
      <path d="M0 808 Q 136 761 273 818 T 390 799 L390 940 L0 940Z" fill={p.field} />
      <rect x="0" y="811" width="390" height="7" fill={p.fenceRail} />
      <rect x="0" y="833" width="390" height="7" fill={p.fenceRail} />
      {POSTS.map((x) => (
        <rect key={x} x={x} y="795" width="10" height="58" rx="4" fill={p.fence} />
      ))}
      <path d="M0 888 Q 98 874 195 888 T 390 884 L390 940 L0 940Z" fill={p.soil} />
      {GRASS.map((x) => (
        <path
          key={x}
          d={`M${x} 886 Q ${x - 3} 876 ${x - 6} 872 M${x} 886 L${x} 874 M${x} 886 Q ${x + 3} 876 ${x + 6} 872`}
          stroke={p.field}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </svg>
  );
}
