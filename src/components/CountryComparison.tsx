import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import {
  COUNTRIES, CountryCode, ComparisonMetric, countrySeries, comparisonRanking, comparisonRows, describeFlag
} from '../data/countries';
import { dec, REPLACEMENT_TFR } from '../data/derived';

const METRICS: { key: ComparisonMetric; label: string; unit: string; note: string; digits: number }[] = [
  { key: 'tfr', label: 'Plodnosť (TFR)', unit: 'detí na ženu', digits: 2,
    note: 'Priemerný počet detí na ženu pri dnešných vekových mierach plodnosti.' },
  { key: 'birthRate', label: 'Hrubá miera', unit: '‰', digits: 1,
    note: 'Živonarodení na 1 000 obyvateľov. Rozdiely ovplyvňuje aj veková štruktúra populácie.' },
  { key: 'motherAge', label: 'Vek matky', unit: 'roka', digits: 1,
    note: 'Priemerný vek ženy pri pôrode, pri všetkých pôrodoch.' }
];

const Card = styled.section`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: clamp(1rem, 3vw, 1.75rem);
  min-width: 0;
`;
const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  h3 { margin: 0 0 0.5rem; font-size: clamp(1.2rem, 3vw, 1.5rem); letter-spacing: -0.025em; }
  p { margin: 0; color: var(--muted); line-height: 1.6; max-width: 560px; font-size: 0.9rem; }
`;
const Group = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 1.2rem 0 0.6rem;
`;
const Button = styled.button<{ active: boolean }>`
  font: inherit;
  font-size: 0.85rem;
  padding: 0.65rem 0.9rem;
  border-radius: 999px;
  border: 1px solid ${p => p.active ? 'var(--border-strong)' : 'var(--border)'};
  color: ${p => p.active ? 'var(--text)' : 'var(--muted)'};
  background: ${p => p.active ? 'rgba(255,255,255,0.09)' : 'transparent'};
  cursor: pointer;
  &:hover { border-color: var(--text); }
  &:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  &:disabled { cursor: default; opacity: 0.7; }
`;
const Swatch = styled.span<{ color: string; dashed?: boolean }>`
  display: inline-block;
  width: 18px;
  border-top: 3px ${p => p.dashed ? 'dashed' : 'solid'} ${p => p.color};
  vertical-align: middle;
  margin-right: 0.45rem;
`;
const Note = styled.p`
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.65;
  margin: 0.6rem 0;
`;
const ChartBox = styled.div`
  height: 350px;
  margin: 0.8rem -0.5rem;
  @media (max-width: 600px) { height: 290px; }
`;
const Ranking = styled.ol`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.6rem;
  padding: 0;
  margin: 0.75rem 0 1rem;
`;
const RankItem = styled.li<{ selected: boolean }>`
  padding: 0.9rem;
  border: 1px solid ${p => p.selected ? 'rgba(182,242,74,0.35)' : 'var(--border)'};
  border-radius: 14px;
  background: ${p => p.selected ? 'rgba(182,242,74,0.045)' : 'rgba(255,255,255,0.015)'};
  font-size: 0.85rem;
  strong { display: block; font-size: 1.55rem; font-variant-numeric: tabular-nums; margin-top: 0.4rem; }
  small { display: block; color: var(--muted); line-height: 1.5; margin-top: 0.25rem; }
`;
const TooltipBox = styled.div`
  background: #111315;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 0.8rem;
  max-width: min(290px, 78vw);
  font-size: 0.82rem;
  line-height: 1.7;
`;
const TableWrap = styled.div`
  overflow-x: auto;
  max-height: 360px;
  margin-top: 0.75rem;
  table { width: 100%; border-collapse: collapse; font-size: 0.8rem; font-variant-numeric: tabular-nums; }
  th, td { text-align: right; padding: 0.6rem; border-bottom: 1px solid var(--border); white-space: nowrap; }
  th:first-of-type { text-align: left; }
  caption { text-align: left; color: var(--muted); padding-bottom: 0.75rem; line-height: 1.5; }
`;

const CountryComparison: React.FC = () => {
  const [metricKey, setMetricKey] = useState<ComparisonMetric>('tfr');
  const [visible, setVisible] = useState<CountryCode[]>(COUNTRIES.map(country => country.code));
  const metric = METRICS.find(item => item.key === metricKey)!;
  const chartRows = useMemo(() => comparisonRows(metricKey), [metricKey]);
  const ranking = useMemo(() => comparisonRanking(metricKey, visible), [metricKey, visible]);
  const selected = COUNTRIES.filter(country => visible.includes(country.code));
  const values = chartRows.flatMap(row => selected.map(country => row[country.code])).filter((v): v is number => v !== null);
  const domain: [number, number] = metricKey === 'motherAge'
    ? [Math.floor(Math.min(...values)) - 1, Math.ceil(Math.max(...values)) + 1]
    : [0, Math.ceil(Math.max(...values, metricKey === 'tfr' ? REPLACEMENT_TFR : 0) * 10) / 10 + 0.2];
  const format = (value: number) => dec(value, metric.digits);
  const toggleCountry = (code: CountryCode) => setVisible(current => current.includes(code)
    ? current.length > 1 ? current.filter(item => item !== code) : current
    : [...current, code]);

  const renderTooltip = ({ active, label }: { active?: boolean; label?: number | string }) => {
    if (!active || label === undefined) return null;
    const year = Number(label);
    return <TooltipBox>
      <strong>{year} · {metric.label}</strong>
      {selected.map(country => {
        const row = countrySeries.find(series => series.code === country.code)!.rows.find(row => row.year === year);
        const value = row?.[metricKey] ?? null;
        const flag = row?.flags[metricKey] ?? '';
        return <div key={country.code}>
          <Swatch color={country.color} dashed={!!country.dash} />
          {country.name}: {value === null ? 'bez údaja' : format(value) + ' ' + metric.unit}
          {flag && <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{describeFlag(flag)}</div>}
        </div>;
      })}
    </TooltipBox>;
  };

  return <Card aria-labelledby="comparison-title">
    <Header>
      <div>
        <h3 id="comparison-title">Je slovenský vývoj výnimočný?</h3>
        <p>Rovnaké ukazovatele, rovnaká mierka. Pozri sa na Slovensko vedľa susedov a Európskej únie.</p>
      </div>
    </Header>
    <Group role="group" aria-label="Ukazovateľ porovnania">
      {METRICS.map(item => <Button key={item.key} type="button" active={metricKey === item.key}
        aria-label={'Porovnanie: ' + item.label} aria-pressed={metricKey === item.key}
        onClick={() => setMetricKey(item.key)}>{item.label}</Button>)}
    </Group>
    <Note>{metric.note} Jednotka: {metric.unit}.</Note>
    <Group role="group" aria-label="Krajiny v porovnaní">
      {COUNTRIES.map(country => <Button key={country.code} type="button" active={visible.includes(country.code)}
        aria-pressed={visible.includes(country.code)}
        disabled={visible.length === 1 && visible.includes(country.code)}
        onClick={() => toggleCountry(country.code)}>
        <Swatch color={country.color} dashed={!!country.dash} />{country.name}
      </Button>)}
    </Group>
    <Note>V grafe musí zostať aspoň jedna krajina. EÚ (27) je agregát Eurostatu pre 27 členských štátov, nie priemer zobrazených krajín.</Note>
    <ChartBox role="img" aria-label={metric.label + ': vývoj vo vybraných krajinách. Presné hodnoty sú v tabuľke pod grafom.'}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartRows} margin={{ top: 18, right: 16, bottom: 4, left: 0 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="year" tickLine={false} axisLine={false} stroke="#8a8f98" minTickGap={32} tick={{ fontSize: 12 }} />
          <YAxis domain={domain} tickFormatter={value => dec(value, metricKey === 'tfr' ? 1 : 0)}
            tickLine={false} axisLine={false} stroke="#8a8f98" width={42} tick={{ fontSize: 12 }} />
          <Tooltip content={renderTooltip} filterNull={false} cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeDasharray: '3 3' }} />
          {metricKey === 'tfr' && <ReferenceLine y={REPLACEMENT_TFR} stroke="#8a8f98" strokeDasharray="2 6" />}
          {selected.map(country => <Line key={country.code} type="linear" dataKey={country.code} name={country.name}
            stroke={country.color} strokeWidth={2.5} strokeDasharray={country.dash}
            dot={false} activeDot={{ r: 4 }} connectNulls={false} isAnimationActive={false} />)}
        </LineChart>
      </ResponsiveContainer>
    </ChartBox>
    <Note>
      {metricKey === 'tfr' && <>Bodkovaná hranica: približne {dec(REPLACEMENT_TFR)} dieťaťa na ženu pre generačnú výmenu. </>}
      Medzera v čiare znamená chýbajúci údaj, nie nulu.
    </Note>
    <h4 style={{ margin: '1.5rem 0 0' }}>
      {ranking.year === null ? 'Spoločný rok nie je dostupný' : 'Hodnoty v roku ' + ranking.year}
    </h4>
    <Note aria-live="polite">
      {ranking.year === null ? 'Pre vybrané krajiny neexistuje spoločný rok s údajmi.' :
        'Najnovší spoločný rok pre vybrané krajiny; zoradené od najvyššej hodnoty.'}
    </Note>
    <Ranking>
      {ranking.entries.map(entry => {
        const country = COUNTRIES.find(country => country.code === entry.code)!;
        return <RankItem key={entry.code} selected={entry.code === 'SK'}>
          <Swatch color={country.color} dashed={!!country.dash} />{country.name}
          <strong>{format(entry.value)} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{metric.unit}</span></strong>
          {entry.flag && <small>{describeFlag(entry.flag)}</small>}
        </RankItem>;
      })}
    </Ranking>
    <Note>
      Dostupnosť údajov: {selected.map(country => {
        const present = countrySeries.find(series => series.code === country.code)!.rows.filter(row => row[metricKey] !== null);
        return country.name + ' ' + (present.length ? present[0].year + '–' + present[present.length - 1].year : 'bez údajov');
      }).join(' · ')}. Rozsah môže obsahovať medzery.
    </Note>
    <details>
      <summary style={{ cursor: 'pointer', fontSize: '0.85rem', padding: '0.5rem 0' }}>Tabuľka údajov</summary>
      <TableWrap tabIndex={0} aria-label="Posúvateľná tabuľka porovnania krajín">
        <table>
          <caption>{metric.label} ({metric.unit}). Pomlčka = bez údaja. Označenia Eurostatu sú uvedené pri hodnotách.</caption>
          <thead><tr><th scope="col">Rok</th>{selected.map(country => <th scope="col" key={country.code}>{country.name}</th>)}</tr></thead>
          <tbody>{chartRows.map(row => <tr key={row.year}>
            <th scope="row">{row.year}</th>
            {selected.map(country => {
              const flag = countrySeries.find(series => series.code === country.code)!.rows.find(item => item.year === row.year)?.flags[metricKey] ?? '';
              return <td key={country.code}>
                {row[country.code] === null ? '—' : format(row[country.code]!)}
                {flag && <small style={{ display: 'block', color: 'var(--muted)' }}>{describeFlag(flag)}</small>}
              </td>;
            })}
          </tr>)}</tbody>
        </table>
      </TableWrap>
    </details>
  </Card>;
};

export default CountryComparison;
