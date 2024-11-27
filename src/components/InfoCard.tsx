import styled from '@emotion/styled';
import { BirthDataType } from '../data/birthData';

const Card = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border-radius: 15px;
  padding: 1.5rem;
  margin: 1rem 0;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 255, 255, 0.4);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const Title = styled.h3`
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: rgba(255, 255, 255, 0.7);
`;

const Value = styled.span`
  color: #00ffff;
  font-weight: bold;
`;

const Note = styled.p`
  color: rgba(255, 0, 255, 0.9);
  margin: 1rem 0 0 0;
  font-style: italic;
`;

interface InfoCardProps {
  data: BirthDataType;
}

const InfoCard: React.FC<InfoCardProps> = ({ data }) => {
  return (
    <Card>
      <Title>Rok {data.rok}</Title>
      <Stat>
        <Label>Počet živonarodených:</Label>
        <Value>{data.zivonarodeni.toLocaleString()}</Value>
      </Stat>
      <Stat>
        <Label>Hrubá miera pôrodnosti:</Label>
        <Value>{data.miera}‰</Value>
      </Stat>
      <Stat>
        <Label>Celková plodnosť (TFR):</Label>
        <Value>{data.tfr}</Value>
      </Stat>
      <Note>{data.poznamka}</Note>
    </Card>
  );
};

export default InfoCard;
