import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend as RechartsLegend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { birthData } from './data/birthData';
import InfoCard from './components/InfoCard';
import ChartAnnotation, { annotations } from './components/ChartAnnotation';
import TrendExplanation from './components/TrendExplanation';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #111111;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.9);
`;

const Title = styled.h1`
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const ChartContainer = styled.div`
  height: 600px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
`;

const InfoSection = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

const LegendContainer = styled.div`
  text-align: center;
  margin: 2rem auto;
  max-width: 800px;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const LegendItem = styled.div`
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1rem',
        borderRadius: '8px',
      }}>
        <p style={{ color: 'white', margin: '0' }}>{`Rok: ${label}`}</p>
        <p style={{ color: '#00ffff', margin: '0.5rem 0' }}>
          {`Živonarodení: ${payload[0].value.toLocaleString()}`}
        </p>
        <p style={{ color: '#ff00ff', margin: '0.5rem 0' }}>
          {`Miera pôrodnosti: ${payload[1].value}‰`}
        </p>
        <p style={{ color: '#ffff00', margin: '0' }}>
          {`TFR: ${payload[2].value}`}
        </p>
      </div>
    );
  }
  return null;
};

const App: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });

  const handleBarClick = (data: any) => {
    setSelectedYear(data.rok);
  };

  return (
    <AppContainer>
      <Title>Pôrodnosť na Slovensku 1970-2023</Title>
      
      <ChartContainer ref={chartRef}>
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart
            data={birthData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="rok" stroke="rgba(255,255,255,0.7)" />
            <YAxis 
              yAxisId="left" 
              stroke="rgba(255,255,255,0.7)"
              label={{ 
                value: 'Počet živonarodených',
                angle: -90,
                position: 'insideLeft',
                style: { fill: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="rgba(255,255,255,0.7)"
              label={{ 
                value: 'Miera pôrodnosti / TFR',
                angle: 90,
                position: 'insideRight',
                style: { fill: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.9)' }}
            />
            
            <RechartsLegend
              wrapperStyle={{
                paddingTop: '20px',
                color: 'rgba(255,255,255,0.7)'
              }}
            />

            <Bar
              dataKey="zivonarodeni"
              name="Počet živonarodených"
              fill="rgba(0, 255, 255, 0.6)"
              yAxisId="left"
              onClick={handleBarClick}
            />
            
            <Line
              type="monotone"
              dataKey="miera"
              name="Hrubá miera pôrodnosti (‰)"
              stroke="rgba(255, 0, 255, 0.8)"
              yAxisId="right"
              dot={false}
            />
            
            <Line
              type="monotone"
              dataKey="tfr"
              name="Celková plodnosť (TFR)"
              stroke="rgba(255, 255, 0, 0.8)"
              yAxisId="right"
              dot={false}
            />

            {annotations.map(annotation => (
              <ReferenceLine
                key={annotation.year}
                x={annotation.year}
                stroke={annotation.color}
                strokeDasharray="3 3"
                yAxisId="left"
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>

        {annotations.map(annotation => {
          const yearData = birthData.find(d => d.rok === annotation.year);
          if (!yearData || !chartRef.current) return null;

          const chartRect = chartRef.current.getBoundingClientRect();
          const xPos = (annotation.year - 1970) / (2023 - 1970) * chartRect.width;
          const yPos = 50; // Fixed position from top

          return (
            <ChartAnnotation
              key={annotation.year}
              x={xPos}
              y={yPos}
              text={annotation.text}
              color={annotation.color}
            />
          );
        })}
      </ChartContainer>

      <TrendExplanation />

      {selectedYear && (
        <InfoCard
          data={birthData.find(d => d.rok === selectedYear)!}
        />
      )}
    </AppContainer>
  );
};

export default App;
