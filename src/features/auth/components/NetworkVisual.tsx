/**
 * Decorative diagram for the sign-in screen: OneEngine as the hub orchestrating the platform's
 * modules, with signals travelling along the connections. Purely presentational.
 */
const HUB = { x: 300, y: 214 };

const NODES = [
  { x: 92, y: 82, label: 'CI Mapping', sub: 'configuration items', tone: '#34d399' },
  { x: 500, y: 74, label: 'AI Agents', sub: 'models · configs', tone: '#a5b4fc' },
  { x: 514, y: 262, label: 'Runbooks', sub: 'orchestration', tone: '#60a5fa' },
  { x: 300, y: 380, label: 'Execution Reports', sub: 'audit trail', tone: '#38bdf8' },
  { x: 90, y: 300, label: 'Agent Repository', sub: 'windows · linux', tone: '#22d3ee' },
];

const NODE_W = 150;
const NODE_H = 46;

const pathTo = (n: { x: number; y: number }) => {
  const midX = (HUB.x + n.x) / 2;
  return `M ${HUB.x} ${HUB.y} C ${midX} ${HUB.y}, ${midX} ${n.y}, ${n.x} ${n.y}`;
};

export function NetworkVisual({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 440"
      className={`h-auto max-h-[40vh] w-full max-w-[580px] ${className}`}
      role="img"
      aria-label="OneEngine connects CI mapping, AI agents, runbooks, the agent repository and execution reports"
    >
      <defs>
        <linearGradient id="oe-net-pulse" x1="0" x2="1">
          <stop offset="0" stopColor="#3b82f6" stopOpacity="0" />
          <stop offset="1" stopColor="#67e8f9" />
        </linearGradient>
        <linearGradient id="oe-net-hub" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1e3a8a" />
          <stop offset="0.5" stopColor="#2563eb" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="oe-net-hub-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="oe-net-halo">
          <stop offset="0" stopColor="#3b82f6" stopOpacity="0.45" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {NODES.map((n) => (
        <path key={`e-${n.label}`} d={pathTo(n)} className="oe-net-edge" />
      ))}
      {NODES.map((n, i) => (
        <path
          key={`p-${n.label}`}
          d={pathTo(n)}
          className="oe-net-pulse"
          style={{ animationDelay: `${i * -0.95}s` }}
        />
      ))}

      {NODES.map((n, i) => (
        <g key={n.label} transform={`translate(${n.x - NODE_W / 2} ${n.y - NODE_H / 2})`}>
          <rect width={NODE_W} height={NODE_H} rx="10" className="oe-net-node" />
          <circle
            cx="16"
            cy={NODE_H / 2}
            r="3.5"
            fill={n.tone}
            className="oe-net-dot"
            style={{ animationDelay: `${i * 0.6}s` }}
          />
          <text x="28" y="20" className="oe-net-label">
            {n.label}
          </text>
          <text x="28" y="34" className="oe-net-sub">
            {n.sub}
          </text>
        </g>
      ))}

      <ellipse cx={HUB.x} cy={HUB.y} rx="130" ry="80" className="oe-net-hub-halo" />
      <g transform={`translate(${HUB.x - 70} ${HUB.y - 30})`}>
        <rect width="140" height="60" rx="14" className="oe-net-node-hub" />
        <rect x="14" y="16" width="28" height="28" rx="8" fill="url(#oe-net-hub)" />
        <g transform="translate(18 20)" fill="#fff" stroke="#fff">
          <path
            d="M10 10 4.6 5.4M10 10l5.4-4.6M10 10v6.2"
            strokeOpacity="0.7"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="4.6" cy="5.4" r="1.8" stroke="none" />
          <circle cx="15.4" cy="5.4" r="1.8" stroke="none" />
          <circle cx="10" cy="16.2" r="1.8" stroke="none" />
          <circle cx="10" cy="10" r="2.6" stroke="none" />
        </g>
        <text x="52" y="30" className="oe-net-label" style={{ fontSize: 12.5, fontWeight: 600 }}>
          OneEngine
        </text>
        <text x="52" y="44" className="oe-net-sub">
          control plane
        </text>
      </g>
    </svg>
  );
}
