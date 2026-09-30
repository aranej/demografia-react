import React from 'react';
import styled from '@emotion/styled';
import StatTile from './components/StatTile';
import MetricExplorer from './components/MetricExplorer';
import NaturalChange from './components/NaturalChange';
import Eras from './components/Eras';
import {
  nf,
  dec,
  peak,
  latest,
  latestWithTfr,
  latestWithAge,
  youngestMotherYear,
  dropFromPeak,
  belowReplacementSince,
  naturalDecreaseSince,
  naturalChangeLatest,
  first,
  REPLACEMENT_TFR
} from './data/derived';

const Page = styled.main`
  position: relative;
  overflow: hidden;
  padding: 3.5rem 1rem 4rem;

  &::before {
    content: '';
    position: absolute;
    top: -260px;
    left: 50%;
    width: 900px;
    height: 600px;
    transform: translateX(-50%);
    background: radial-gradient(closest-side, rgba(182, 242, 74, 0.14), transparent);
    pointer-events: none;
  }
`;

const Wrap = styled.div`
  position: relative;
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Hero = styled.header`
  padding: 1rem 0 2rem;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--muted);
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.03);

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
  }
`;

const Title = styled.h1`
  margin: 1.25rem 0 0.5rem;
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.05;
  text-wrap: balance;
`;

const Big = styled.span`
  background: linear-gradient(180deg, #ffffff 10%, var(--accent) 120%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  white-space: nowrap;
`;

const Lead = styled.p`
  margin: 0;
  max-width: 640px;
  color: var(--muted);
  font-size: clamp(1rem, 2vw, 1.15rem);
  line-height: 1.6;
`;

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  margin: 2rem 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const Footer = styled.footer`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.7;

  a {
    color: var(--text);
    text-decoration-color: var(--border-strong);
    text-underline-offset: 3px;
  }
`;

const App: React.FC = () => (
  <Page>
    <Wrap>
      <Hero>
        <Eyebrow>Demografia · Slovensko · {first.rok}–{latest.rok}</Eyebrow>
        <Title>
          Pôrodnosť na Slovensku: <Big>−{dropFromPeak}&nbsp;%</Big> od vrcholu
        </Title>
        <Lead>
          V roku {peak.rok} sa narodilo {nf.format(peak.zivonarodeni)} detí, v roku {latest.rok} už len{' '}
          {nf.format(latest.zivonarodeni)}. Takto vyzerá šesť desaťročí vývoja v číslach.
        </Lead>
      </Hero>

      <Tiles>
        <StatTile
          label={`Narodení ${latest.rok}`}
          value={nf.format(latest.zivonarodeni)}
          note={`Vrchol bol v roku ${peak.rok}: ${nf.format(peak.zivonarodeni)} detí.`}
          accent="#b6f24a"
        />
        <StatTile
          label={`Plodnosť (TFR) ${latestWithTfr.rok}`}
          value={dec(latestWithTfr.tfr!, 2)}
          note={`Na udržanie počtu obyvateľov treba približne ${dec(REPLACEMENT_TFR, 1)}. Pod touto hranicou sme od roku ${belowReplacementSince}.`}
          accent="#8b9bff"
        />
        <StatTile
          label={`Vek matky pri pôrode ${latestWithAge.rok}`}
          value={`${dec(latestWithAge.vekMatky!)} roka`}
          note={`V roku ${youngestMotherYear.rok} to bolo ${dec(youngestMotherYear.vekMatky!)} roka.`}
          accent="#5eead4"
        />
        <StatTile
          label={`Prirodzený úbytok ${latest.rok}`}
          value={`−${nf.format(Math.abs(naturalChangeLatest))}`}
          note={`Od roku ${naturalDecreaseSince} zomiera ročne viac ľudí, než sa narodí.`}
          accent="#ff7a59"
        />
      </Tiles>

      <SectionTitle>Preskúmaj ukazovatele</SectionTitle>
      <MetricExplorer />

      <NaturalChange />

      <SectionTitle>Šesť období</SectionTitle>
      <Eras />

      <Footer>
        <div>
          Zdroj: Eurostat, tabuľky <code>demo_gind</code> a <code>demo_find</code> (pôvodné dáta Štatistického úradu SR),
          stiahnuté 30. 9. 2026. Údaje za rok {latest.rok} sú najnovšie dostupné (Eurostat, aktualizované 21. 7. 2026) a môžu sa
          ešte upraviť. TFR a vek matky za {latest.rok} zatiaľ nie sú zverejnené.
        </div>
        <div>
          TFR = celková plodnosť, priemerný počet detí na ženu pri dnešných vekových mierach plodnosti. Hrubá miera
          pôrodnosti = živonarodení na 1 000 obyvateľov.
        </div>
      </Footer>
    </Wrap>
  </Page>
);

export default App;
