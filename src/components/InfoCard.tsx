import styled from '@emotion/styled';
import { BirthDataType } from '../data/birthData';

const Card = styled.section`
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

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);

  &:last-of-type {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: var(--muted);
`;

const Value = styled.span`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

const Note = styled.p`
  margin: 0.75rem 0 0 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
`;

interface InfoCardProps {
  data: BirthDataType;
}

const InfoCard: React.FC<InfoCardProps> = ({ data }) => (
  <Card aria-live="polite">
    <Title>Rok {data.rok}</Title>
    <Stat>
      <Label>Živonarodení</Label>
      <Value>{data.zivonarodeni.toLocaleString('sk-SK')}</Value>
    </Stat>
    <Stat>
      <Label>Hrubá miera pôrodnosti</Label>
      <Value>{data.miera.toLocaleString('sk-SK')} ‰</Value>
    </Stat>
    <Stat>
      <Label>Celková plodnosť (TFR)</Label>
      <Value>{data.tfr.toLocaleString('sk-SK', { minimumFractionDigits: 2 })}</Value>
    </Stat>
    <Note>{data.poznamka}</Note>
  </Card>
);

export default InfoCard;
