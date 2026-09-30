import styled from '@emotion/styled';

const Container = styled.section`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const Period = styled.div<{ accent: string }>`
  padding: 0.25rem 0 0.25rem 1rem;
  margin: 1rem 0;
  border-left: 3px solid ${props => props.accent};
`;

const PeriodTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
`;

const PeriodText = styled.p`
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const periods = [
  {
    accent: '#4fb3a9',
    title: '1970–1989: Vysoká pôrodnosť',
    text: 'Pro-natalitná politika, stabilné sociálne istoty a podpora mladých rodín. Vrchol v roku 1975 („Husákove deti").'
  },
  {
    accent: '#e8b04a',
    title: '1990–2000: Transformácia',
    text: 'Prudký pokles po páde komunizmu: ekonomická transformácia, nezamestnanosť a odkladanie rodičovstva do vyššieho veku.'
  },
  {
    accent: '#8aa4d6',
    title: '2000–2019: Stabilizácia na nízkej úrovni',
    text: 'TFR sa pohybuje okolo 1,2–1,4 dieťaťa na ženu, s krátkym oživením okolo roku 2011.'
  },
  {
    accent: '#e0705f',
    title: '2020–2023: Pandémia a nové minimum',
    text: 'Vplyv pandémie COVID-19, ekonomická neistota a ďalší pokles počtu narodených.'
  }
];

const TrendExplanation = () => (
  <Container>
    <Title>Kľúčové obdobia vývoja pôrodnosti</Title>
    {periods.map(p => (
      <Period key={p.title} accent={p.accent}>
        <PeriodTitle>{p.title}</PeriodTitle>
        <PeriodText>{p.text}</PeriodText>
      </Period>
    ))}
  </Container>
);

export default TrendExplanation;
