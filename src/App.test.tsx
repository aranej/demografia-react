import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { birthData } from './data/birthData';

test('renders the headline and key figures from the data', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Pôrodnosť na Slovensku/);
  expect(screen.getByText('Narodení 2025')).toBeInTheDocument();
  expect(screen.getByText('Šesť období')).toBeInTheDocument();
});

test('metric switch toggles pressed state', () => {
  render(<App />);
  const tfr = screen.getByRole('button', { name: 'Plodnosť (TFR)' });
  expect(tfr).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(tfr);
  expect(tfr).toHaveAttribute('aria-pressed', 'true');
});

test('data covers every year without gaps', () => {
  const years = birthData.map(d => d.rok);
  expect(years[0]).toBe(1960);
  years.forEach((y, i) => i > 0 && expect(y).toBe(years[i - 1] + 1));
});
