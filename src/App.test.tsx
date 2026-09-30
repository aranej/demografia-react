import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the page title and summary', () => {
  render(<App />);
  expect(screen.getByText(/Pôrodnosť na Slovensku 1970–2023/)).toBeInTheDocument();
  expect(screen.getByText(/Kľúčové obdobia vývoja pôrodnosti/)).toBeInTheDocument();
});
