import styled from '@emotion/styled';

const Container = styled.div`
  margin: 2rem auto;
  max-width: 800px;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h3`
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1rem 0;
  text-align: center;
`;

const Period = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  border-left: 3px solid ${props => props.color};
`;

const PeriodTitle = styled.h4`
  color: ${props => props.color};
  margin: 0 0 0.5rem 0;
`;

const PeriodText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
`;

const TrendExplanation = () => {
  return (
    <Container>
      <Title>Kľúčové obdobia vývoja pôrodnosti</Title>
      
      <Period color="rgba(0, 255, 255, 0.9)">
        <PeriodTitle color="rgba(0, 255, 255, 0.9)">
          1970-1989: Obdobie vysokej pôrodnosti
        </PeriodTitle>
        <PeriodText>
          Aktívna pro-natalitná politika, stabilné sociálne istoty a podpora mladých rodín.
          Vrchol v roku 1975 ("Husákove deti"). Priemerný vek matiek pri prvom dieťati okolo 22-23 rokov.
        </PeriodText>
      </Period>

      <Period color="rgba(255, 0, 255, 0.9)">
        <PeriodTitle color="rgba(255, 0, 255, 0.9)">
          1990-2000: Transformačné obdobie
        </PeriodTitle>
        <PeriodText>
          Prudký pokles po páde komunizmu. Ekonomická transformácia, nezamestnanosť
          a zmena životného štýlu. Odkladanie rodičovstva do vyššieho veku.
        </PeriodText>
      </Period>

      <Period color="rgba(255, 255, 0, 0.9)">
        <PeriodTitle color="rgba(255, 255, 0, 0.9)">
          2000-2019: Stabilizácia na nízkej úrovni
        </PeriodTitle>
        <PeriodText>
          TFR okolo 1.2-1.4 dieťaťa na ženu. Výrazné regionálne rozdiely.
          Priemerný vek matiek pri prvom dieťati nad 27 rokov.
        </PeriodText>
      </Period>

      <Period color="rgba(255, 0, 0, 0.9)">
        <PeriodTitle color="rgba(255, 0, 0, 0.9)">
          2020-2023: Pandémia a historické minimum
        </PeriodTitle>
        <PeriodText>
          Vplyv pandémie COVID-19, ekonomická neistota a ďalšie prehlbovanie poklesu.
          V roku 2023 dosiahnuté historické minimum s TFR 1.18.
        </PeriodText>
      </Period>
    </Container>
  );
};

export default TrendExplanation;
