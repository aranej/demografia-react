import React from 'react';
import styled from '@emotion/styled';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea
} from 'recharts';
import { birthData } from '../data/birthData';
import { nf, latest, naturalDecreaseSince } from '../data/derived';

const BIRTHS = '#b6f24a';
const DEATHS = '#ff7a59';

const Card = styled.section`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 1.5rem 1rem 1rem;
`;

const Head = styled.div`
  padding: 0 0.5rem 1rem;
`;

const Title = styled.h2`
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const Sub = styled.p`
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const Legend = styled.div`
  display: flex;
  gap: 1.25rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--muted);
`;

const Dot = styled.span<{ color: string }>`
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  margin-right: 0.4rem;
  background: ${p => p.color};
`;

const ChartBox = styled.div`
  height: 300px;
`;

const TooltipBox = styled.div`
  background: rgba(12, 12, 14, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  font-size: 0.85rem;
  line-height: 1.6;
  font-variant-numeric: tabular-nums;
`;

const renderTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  const diff = row.zivonarodeni - row.umrtia;
  return (
    <TooltipBox>
      <div style={{ color: 'var(--muted)' }}>{row.rok}</div>
      <div style={{ color: BIRTHS }}>Narodení: {nf.format(row.zivonarodeni)}</div>
      <div style={{ color: DEATHS }}>Zomrelo: {nf.format(row.umrtia)}</div>
      <div>
        Rozdiel: {diff > 0 ? '+' : '−'}
        {nf.format(Math.abs(diff))}
      </div>
    </TooltipBox>
  );
};

const NaturalChange: React.FC = () => (
  <Card>
    <Head>
      <Title>Narodení vs. zomrelí</Title>
      <Sub>
        Od roku {naturalDecreaseSince} sa na Slovensku každý rok narodí menej ľudí, než zomrie. V roku {latest.rok} to
        bolo {nf.format(latest.umrtia - latest.zivonarodeni)} ľudí v mínuse.
      </Sub>
      <Legend>
        <span>
          <Dot color={BIRTHS} />
          Narodení
        </span>
        <span>
          <Dot color={DEATHS} />
          Zomrelí
        </span>
      </Legend>
    </Head>
    <ChartBox>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={birthData} margin={{ top: 16, right: 16, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="grad-births-deaths" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BIRTHS} stopOpacity={0.3} />
              <stop offset="100%" stopColor={BIRTHS} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="rok" tickLine={false} axisLine={false} stroke="#6b7078" tick={{ fontSize: 12 }} minTickGap={28} />
          <YAxis
            tickLine={false}
            axisLine={false}
            stroke="#6b7078"
            tick={{ fontSize: 12 }}
            domain={[0, 110000]}
            tickFormatter={(v: number) => (v === 0 ? '0' : `${v / 1000} tis.`)}
            width={60}
          />
          <Tooltip content={renderTooltip} cursor={{ stroke: 'rgba(255,255,255,0.25)', strokeDasharray: '3 3' }} />
          <ReferenceArea x1={naturalDecreaseSince} x2={latest.rok} fill={DEATHS} fillOpacity={0.08} />
          <Area type="monotone" dataKey="zivonarodeni" stroke={BIRTHS} strokeWidth={2.5} fill="url(#grad-births-deaths)" dot={false} />
          <Line type="monotone" dataKey="umrtia" stroke={DEATHS} strokeWidth={2.5} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartBox>
  </Card>
);

export default NaturalChange;
