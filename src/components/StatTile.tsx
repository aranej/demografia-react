import styled from '@emotion/styled';

const Tile = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.25rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: var(--border-strong);
    transform: translateY(-2px);
  }
`;

const Label = styled.div`
  color: var(--muted);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const Value = styled.div<{ accent: string }>`
  font-size: clamp(2rem, 4vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  color: ${p => p.accent};
`;

const Note = styled.div`
  color: var(--muted);
  font-size: 0.88rem;
  line-height: 1.45;
`;

interface StatTileProps {
  label: string;
  value: string;
  note: string;
  accent: string;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, note, accent }) => (
  <Tile>
    <Label>{label}</Label>
    <Value accent={accent}>{value}</Value>
    <Note>{note}</Note>
  </Tile>
);

export default StatTile;
