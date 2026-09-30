import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { birthData } from '../data/birthData';
import { annotations } from '../data/annotations';
import { nf, dec, REPLACEMENT_TFR } from '../data/derived';

type MetricKey = 'zivonarodeni' | 'tfr' | 'miera' | 'vekMatky';

interface Metric {
  key: MetricKey;
  label: string;
  color: string;
  format: (v: number) => string;
  axis: (v: number) => string;
  domain: [number, number];
  note: string;
}

const METRICS: Metric[] = [
  {
    key: 'zivonarodeni',
    label: 'Narodení',
    color: '#b6f24a',
    format: v => nf.format(v),
    axis: v => (v === 0 ? '0' : `${v / 1000} tis.`),
    domain: [0, 110000],
    note: 'Počet živonarodených detí za rok.'
  },
  {
    key: 'tfr',
    label: 'Plodnosť (TFR)',
    color: '#8b9bff',
    format: v => dec(v, 2),
    axis: v => dec(v, 1),
    domain: [0, 3.5],
    note: 'Priemerný počet detí na ženu. Na udržanie počtu obyvateľov treba približne 2,1.'
  },
  {
    key: 'miera',
    label: 'Hrubá miera',
    color: '#ffb454',
    format: v => `${dec(v, 1)} ‰`,
    axis: v => String(v),
    domain: [0, 25],
    note: 'Počet narodených na 1 000 obyvateľov.'
  },
  {
    key: 'vekMatky',
    label: 'Vek matky',
    color: '#5eead4',
    format: v => `${dec(v, 1)} r.`,
    axis: v => String(v),
    domain: [22, 30],
    note: 'Priemerný vek ženy pri pôrode.'
  }
];

const RANGES = [
  { label: 'Všetko', from: 1960 },
  { label: 'Od 1990', from: 1990 },
  { label: 'Od 2010', from: 2010 }
];

const Card = styled.section`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 1.5rem 1rem 1rem;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 0.5rem 1rem;
`;

const Group = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 999px;
`;

const Pill = styled.button<{ active: boolean; accent: string }>`
  font: inherit;
  font-size: 0.85rem;
  color: ${p => (p.active ? '#0a0a0b' : 'var(--muted)')};
  background: ${p => (p.active ? p.accent : 'transparent')};
  border: none;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  font-weight: ${p => (p.active ? 600 : 500)};
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    color: ${p => (p.active ? '#0a0a0b' : 'var(--text)')};
  }

  &:focus-visible {
    outline: 2px solid var(--text);
    outline-offset: 2px;
  }
`;

const Note = styled.p`
  margin: 0;
  padding: 0 0.5rem 0.5rem;
  color: var(--muted);
  font-size: 0.9rem;
`;

const ChartBox = styled.div`
  height: 380px;
`;

const TooltipBox = styled.div`
  background: rgba(12, 12, 14, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  min-width: 170px;
`;

const TooltipYear = styled.div`
  color: var(--muted);
  font-size: 0.8rem;
`;

const TooltipValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

const TooltipExtra = styled.div`
  margin-top: 0.3rem;
  padding-top: 0.4rem;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.6;
`;

const MetricExplorer: React.FC = () => {
  const [metricKey, setMetricKey] = useState<MetricKey>('zivonarodeni');
  const [from, setFrom] = useState(1960);
  const metric = METRICS.find(m => m.key === metricKey)!;
  const data = useMemo(() => birthData.filter(d => d.rok >= from), [from]);
  const gradientId = `grad-${metric.key}`;

  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const row = payload[0].payload;
    const value = row[metric.key];
    return (
      <TooltipBox>
        <TooltipYear>{row.rok}</TooltipYear>
        <TooltipValue style={{ color: metric.color }}>
          {value === null ? 'bez údaja' : metric.format(value)}
        </TooltipValue>
        <TooltipExtra>
          Narodení: {nf.format(row.zivonarodeni)}
          <br />
          TFR: {row.tfr === null ? '–' : dec(row.tfr, 2)}
        </TooltipExtra>
      </TooltipBox>
    );
  };

  return (
    <Card>
      <Toolbar>
        <Group role="group" aria-label="Ukazovateľ">
          {METRICS.map(m => (
            <Pill
              key={m.key}
              type="button"
              active={m.key === metricKey}
              accent={m.color}
              aria-pressed={m.key === metricKey}
              onClick={() => setMetricKey(m.key)}
            >
              {m.label}
            </Pill>
          ))}
        </Group>
        <Group role="group" aria-label="Obdobie">
          {RANGES.map(r => (
            <Pill
              key={r.from}
              type="button"
              active={r.from === from}
              accent="#ededed"
              aria-pressed={r.from === from}
              onClick={() => setFrom(r.from)}
            >
              {r.label}
            </Pill>
          ))}
        </Group>
      </Toolbar>
      <Note>{metric.note}</Note>
      <ChartBox>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart key={metric.key} data={data} margin={{ top: 28, right: 16, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="rok"
              tickLine={false}
              axisLine={false}
              stroke="#6b7078"
              tick={{ fontSize: 12 }}
              minTickGap={28}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#6b7078"
              tick={{ fontSize: 12 }}
              domain={metric.domain}
              tickFormatter={metric.axis}
              width={60}
              allowDataOverflow
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: 'rgba(255,255,255,0.25)', strokeDasharray: '3 3' }} />
            {annotations
              .filter(a => a.year >= from)
              .map(a => (
                <ReferenceLine
                  key={a.year}
                  x={a.year}
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="2 4"
                  label={{ value: a.label, position: 'top', fill: '#8a8f98', fontSize: 11 }}
                />
              ))}
            {metric.key === 'tfr' && (
              <ReferenceLine
                y={REPLACEMENT_TFR}
                stroke="#8b9bff"
                strokeDasharray="6 4"
                strokeOpacity={0.6}
                label={{ value: 'Generačná výmena 2,1', position: 'insideTopRight', fill: '#8b9bff', fontSize: 11 }}
              />
            )}
            <Area
              type="monotone"
              dataKey={metric.key}
              stroke={metric.color}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: metric.color }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartBox>
    </Card>
  );
};

export default MetricExplorer;
