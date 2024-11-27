import styled from '@emotion/styled';

const AnnotationContainer = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transform: translate(-50%, -100%);
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  max-width: 200px;
  pointer-events: none;
  z-index: 1000;
  transition: opacity 0.3s ease;
`;

const AnnotationText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-size: 0.8rem;
  text-align: center;
`;

const AnnotationLine = styled.div<{ color: string }>`
  position: absolute;
  bottom: -20px;
  left: 50%;
  width: 2px;
  height: 20px;
  background: ${props => props.color};
`;

interface ChartAnnotationProps {
  x: number;
  y: number;
  text: string;
  color?: string;
}

const ChartAnnotation: React.FC<ChartAnnotationProps> = ({ 
  x, 
  y, 
  text,
  color = 'rgba(255, 255, 255, 0.5)'
}) => {
  return (
    <AnnotationContainer x={x} y={y}>
      <AnnotationText>{text}</AnnotationText>
      <AnnotationLine color={color} />
    </AnnotationContainer>
  );
};

export const annotations = [
  {
    year: 1975,
    text: "Vrchol pôrodnosti - 'Husákove deti', silná pro-natalitná politika",
    color: "rgba(0, 255, 255, 0.8)"
  },
  {
    year: 1989,
    text: "Pád komunizmu - začiatok prudkého poklesu pôrodnosti",
    color: "rgba(255, 0, 255, 0.8)"
  },
  {
    year: 2002,
    text: "Historické minimum pred krízou (1.2 TFR)",
    color: "rgba(255, 255, 0, 0.8)"
  },
  {
    year: 2011,
    text: "Posledný výraznejší vrchol pôrodnosti",
    color: "rgba(0, 255, 255, 0.8)"
  },
  {
    year: 2020,
    text: "Začiatok pandémie COVID-19",
    color: "rgba(255, 0, 255, 0.8)"
  },
  {
    year: 2023,
    text: "Historické minimum (1.18 TFR)",
    color: "rgba(255, 255, 0, 0.8)"
  }
];

export default ChartAnnotation;
