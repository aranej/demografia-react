import styled from '@emotion/styled';
import { byYear, nf, dec } from '../data/derived';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

const Card = styled.article`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.25rem 1.4rem;
`;

const Years = styled.div`
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
`;

const Title = styled.h3`
  margin: 0.35rem 0 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const Stat = styled.div`
  font-size: 1.05rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin-bottom: 0.5rem;
`;

const Text = styled.p`
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.55;
`;

const births = (from: number, to: number) =>
  `${nf.format(byYear(from).zivonarodeni)} → ${nf.format(byYear(to).zivonarodeni)} narodených`;

const pctChange = (from: number, to: number) =>
  Math.round((1 - byYear(to).zivonarodeni / byYear(from).zivonarodeni) * 100);

const tfr = (year: number) => dec(byYear(year).tfr!, 2);

const eras = [
  {
    years: '1960–1979',
    title: 'Rast k vrcholu',
    stat: births(1960, 1979),
    text: `Počet narodených vrcholí v roku 1979 (${nf.format(byYear(1979).zivonarodeni)}). V 70. rokoch sa plodnosť drží medzi ${tfr(1970)} a ${tfr(1974)} dieťaťa na ženu.`
  },
  {
    years: '1980–1993',
    title: 'Pozvoľný pokles',
    stat: births(1980, 1993),
    text: `Plodnosť klesá pod hranicu generačnej výmeny (2,1) v roku 1989 a odvtedy sa nad ňu nevrátila.`
  },
  {
    years: '1994–2002',
    title: 'Prepad',
    stat: births(1994, 2002),
    text: `Najväčší medziročný pokles v celom rade je z roku 1993 na 1994 (−9 %). TFR padá z ${tfr(1993)} na ${tfr(2002)}.`
  },
  {
    years: '2003–2011',
    title: 'Oživenie',
    stat: births(2003, 2011),
    text: `TFR stúpa z ${tfr(2003)} na ${tfr(2011)}. Matky rodia neskôr: vek pri prvom dieťati rastie z ${dec(byYear(2003).vekPrve!)} na ${dec(byYear(2011).vekPrve!)} roka.`
  },
  {
    years: '2012–2021',
    title: 'Plató',
    stat: births(2012, 2021),
    text: `Počet narodených sa drží okolo 55–58 tisíc ročne, plodnosť pomaly rastie až na ${tfr(2021)}.`
  },
  {
    years: '2022–2025',
    title: 'Nový prepad',
    stat: births(2022, 2025),
    text: `Oproti roku 2021 je to o ${pctChange(2021, 2025)} % menej narodených. TFR klesá na ${tfr(2024)} (2024).`
  }
];

const Eras = () => (
  <Grid>
    {eras.map(e => (
      <Card key={e.years}>
        <Years>{e.years}</Years>
        <Title>{e.title}</Title>
        <Stat>{e.stat}</Stat>
        <Text>{e.text}</Text>
      </Card>
    ))}
  </Grid>
);

export default Eras;
