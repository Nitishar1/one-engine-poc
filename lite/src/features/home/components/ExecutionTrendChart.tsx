import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/hooks/useTheme';
import type { DailyExecutionPoint } from '../types/home.types';

interface TooltipPayload {
  payload: DailyExecutionPoint;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const total = point.success + point.failed;
  const rows = [
    { label: 'Success', value: point.success, color: 'var(--oe-chart-1)' },
    { label: 'Failed', value: point.failed, color: 'var(--oe-chart-2)' },
  ];
  return (
    <div className="oe-glass min-w-[160px] rounded-lg border border-line-strong px-3 py-2.5 text-[12.5px] shadow-pop">
      <div className="mb-1.5 flex justify-between gap-4 font-medium text-fg">
        <span>{point.date}</span>
        <span className="tabular-nums text-fg-muted">{total} runs</span>
      </div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 py-0.5 text-fg-secondary">
          <span className="h-2 w-2 rounded-[2px]" style={{ background: r.color }} />
          {r.label}
          <span className="ml-auto font-medium tabular-nums text-fg">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Daily runs as thin lines: a gradient-filled success area over a fine failure line. */
export function ExecutionTrendChart({ data }: { data: DailyExecutionPoint[] }) {
  const { tokens } = useTheme();
  const axis = { fontSize: 11.5, fill: tokens.textMuted };
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="oe-area-success" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={tokens.chart1} stopOpacity={0.32} />
              <stop offset="1" stopColor={tokens.chart1} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="oe-line-success" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={tokens.chart1} />
              <stop offset="1" stopColor={tokens.chart1End} />
            </linearGradient>
            <linearGradient id="oe-area-failed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={tokens.chart2} stopOpacity={0.14} />
              <stop offset="1" stopColor={tokens.chart2} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={tokens.chartGrid} vertical={false} strokeDasharray="3 4" />
          <XAxis
            dataKey="date"
            tick={axis}
            tickLine={false}
            axisLine={{ stroke: tokens.border }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            cursor={{ stroke: tokens.primary, strokeOpacity: 0.4, strokeDasharray: '3 3' }}
            content={<ChartTooltip />}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="failed"
            name="Failed"
            stroke={tokens.chart2}
            strokeWidth={1.5}
            fill="url(#oe-area-failed)"
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 0, fill: tokens.chart2 }}
            animationDuration={800}
            animationBegin={150}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="success"
            name="Success"
            stroke="url(#oe-line-success)"
            strokeWidth={2}
            fill="url(#oe-area-success)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: tokens.surface, fill: tokens.chart1 }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
