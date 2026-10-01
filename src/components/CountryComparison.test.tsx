import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CountryComparison from './CountryComparison';

test('switches measures and shows shared-year values in an accessible data table', () => {
  render(<CountryComparison />);
  const age = screen.getByRole('button', { name: 'Porovnanie: Vek matky' });
  fireEvent.click(age);
  expect(age).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Porovnanie: Plodnosť (TFR)' })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByText(/Medzera v čiare/)).toBeInTheDocument();
  expect(within(screen.getByRole('table')).getByRole('columnheader', { name: 'Slovensko' })).toBeInTheDocument();
});

test('country filtering updates chart and table and prevents an empty selection', () => {
  render(<CountryComparison />);
  const countries = screen.getByRole('group', { name: 'Krajiny v porovnaní' });
  for (const name of ['Česko', 'Poľsko', 'Maďarsko', 'EÚ (27)']) fireEvent.click(within(countries).getByRole('button', { name }));
  const sk = within(countries).getByRole('button', { name: 'Slovensko' });
  expect(sk).toBeDisabled();
  expect(sk).toHaveAttribute('aria-pressed', 'true');
  expect(within(screen.getByRole('table')).queryByRole('columnheader', { name: 'Česko' })).not.toBeInTheDocument();
  const cz = within(countries).getByRole('button', { name: 'Česko' });
  fireEvent.click(cz);
  expect(sk).not.toBeDisabled();
  expect(cz).toHaveAttribute('aria-pressed', 'true');
});
