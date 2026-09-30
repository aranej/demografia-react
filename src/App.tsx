import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { birthData } from './data/birthData';
import { annotations } from './data/annotations';
import InfoCard from './components/InfoCard';
import TrendExplanation from './components/TrendExplanation';

const BAR = '#4fb3a9';
const BAR_ACTIVE = '#7fd6cc';
const RATE = '#e8b04a';
const TFR = '#e0705f';

const Page = styled.main`
  min-height: 100vh;
  padding: 2rem 1rem 3rem;
`;

const Wrap = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  margin: 0 0 0.25rem 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--muted);
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SummaryCard = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
`;

const SummaryLabel = styled.div`
  color: var(--muted);
  font-size: 0.85rem;
`;

const SummaryValue = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

const SummaryNote = styled.div`
  color: var(--muted);
  font-size: 0.85rem;
`;

const ChartCard = styled.section`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem 0.5rem 0.75rem;
  margin-bottom: 1rem;
`;

const ChartBox = styled.div`
  height: 440px;
`;

const ChartHint = styled.p`
  margin: 0.5rem 1rem 0;
  color: var(--muted);
  font-size: 0.8rem;
`;

const Details = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

const Footer = styled.footer`
  margin-top: 2rem;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.5;
`;

const TooltipBox = styled.div`
  background: #0d0f13;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-size: 0.85rem;
  line-height: 1.6;
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  return (
    <TooltipBox>
      <strong>{label}</strong>
      <div style={{ color: BAR }}>Živonarodení: {row.zivonarodeni.toLocaleString('sk-SK')}</div>
      <div style={{ color: RATE }}>Miera: {row.miera} ‰</div>
      <div style={{ color: TFR }}>TFR: {row.tfr.toFixed(2)}</div>
    </TooltipBox>
  );
};

const first = birthData[0];
const last = birthData[birthData.length - 1];
const peak = birthData.reduce((a, b) => (b.zivonarodeni > a.zivonarodeni ? b : a));
const drop = Math.round((1 - last.zivonarodeni / peak.zivonarodeni) * 100);

const App: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(last.rok);

  const handleChartClick = (state: any) => {
    const year = Number(state?.activeLabel);
    if (!Number.isNaN(year) && birthData.some(d => d.rok === year)) {
      setSelectedYear(year);
    }
  };

  const selected = birthData.find(d => d.rok === selectedYear) ?? last;

  return (
    <Page>
      <Wrap>
        <Header>
          <Title>Pôrodnosť na Slovensku {first.rok}–{last.rok}</Title>
          <Subtitle>Počet živonarodených, hrubá miera pôrodnosti a celková plodnosť (TFR)</Subtitle>
        </Header>

        <Summary>
          <SummaryCard>
            <SummaryLabel>Vrchol ({peak.rok})</SummaryLabel>
            <SummaryValue>{peak.zivonarodeni.toLocaleString('sk-SK')}</SummaryValue>
            <SummaryNote>živonarodených</SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Posledný rok ({last.rok})</SummaryLabel>
            <SummaryValue>{last.zivonarodeni.toLocaleString('sk-SK')}</SummaryValue>
            <SummaryNote>živonarodených</SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Zmena od vrcholu</SummaryLabel>
            <SummaryValue>−{drop} %</SummaryValue>
            <SummaryNote>TFR {last.tfr.toFixed(2)} (z {peak.tfr.toFixed(2)})</SummaryNote>
          </SummaryCard>
        </Summary>

        <ChartCard>
          <ChartBox>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={birthData}
                margin={{ top: 24, right: 12, bottom: 8, left: 4 }}
                onClick={handleChartClick}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="rok" stroke="#8b93a1" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  stroke="#8b93a1"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => `${v / 1000} tis.`}
                  width={56}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#8b93a1"
                  tick={{ fontSize: 12 }}
                  domain={[0, 20]}
                  width={32}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend wrapperStyle={{ paddingTop: 8, fontSize: 13 }} />

                <Bar dataKey="zivonarodeni" name="Živonarodení" yAxisId="left" fill={BAR} radius={[3, 3, 0, 0]}>
                  {birthData.map(d => (
                    <Cell key={d.rok} fill={d.rok === selectedYear ? BAR_ACTIVE : BAR} fillOpacity={d.rok === selectedYear ? 1 : 0.75} />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="miera"
                  name="Hrubá miera pôrodnosti (‰)"
                  stroke={RATE}
                  strokeWidth={2}
                  yAxisId="right"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tfr"
                  name="Celková plodnosť (TFR)"
                  stroke={TFR}
                  strokeWidth={2}
                  yAxisId="right"
                  dot={false}
                />

                {annotations.map(a => (
                  <ReferenceLine
                    key={a.year}
                    x={a.year}
                    yAxisId="left"
                    stroke={a.color}
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                    label={{ value: a.label, position: 'top', fill: a.color, fontSize: 11 }}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartBox>
          <ChartHint>
            Kliknutím na stĺpec zobrazíš detail roku. Do roku 1990 sú údaje po piatich rokoch, odvtedy ročne.
          </ChartHint>
        </ChartCard>

        <Details>
          <TrendExplanation />
          <InfoCard data={selected} />
        </Details>

        <Footer>
          Údaje v tomto projekte pôvodne vygeneroval jazykový model a nie sú overené voči oficiálnym štatistikám
          (ŠÚ SR). Projekt slúži ako experiment s kódovaním pomocou LLM a s automatickým nasadením cez GitHub a Vercel.
        </Footer>
      </Wrap>
    </Page>
  );
};

export default App;
