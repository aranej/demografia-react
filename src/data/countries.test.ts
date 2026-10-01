import { countrySeries, COUNTRIES, countrySources, comparisonRows, comparisonRanking, latestCommonYear, CountrySeries } from './countries';
import { birthData } from './birthData';

test('every country has unique continuous annual rows with numeric or null observations', () => {
  expect(countrySeries.map(country => country.code)).toEqual(COUNTRIES.map(country => country.code));
  for (const country of countrySeries) {
    const years = country.rows.map(row => row.year);
    expect(new Set(years).size).toBe(years.length);
    expect(years[0]).toBe(1960);
    country.rows.forEach((row, index) => {
      expect(row.year).toBe(1960 + index);
      for (const metric of ['tfr', 'birthRate', 'motherAge'] as const) {
        expect(row[metric] === null || (Number.isFinite(row[metric]) && row[metric]! >= 0)).toBe(true);
      }
    });
  }
  expect(countrySources).toHaveLength(15);
  countrySources.forEach(source => expect(new URL(source.url).hostname).toBe('ec.europa.eu'));
});

test('missing early EU observations remain gaps, and SK overlaps match the existing source data', () => {
  const eu = countrySeries.find(country => country.code === 'EU27_2020')!;
  expect(eu.rows.find(row => row.year === 2000)!.tfr).toBeNull();
  expect(comparisonRows('tfr').find(row => row.year === 2000)!.EU27_2020).toBeNull();
  const sk = countrySeries.find(country => country.code === 'SK')!;
  for (const row of birthData) {
    const comparison = sk.rows.find(item => item.year === row.rok)!;
    expect(comparison.tfr).toBe(row.tfr);
    expect(comparison.birthRate).toBe(row.miera);
    expect(comparison.motherAge).toBe(row.vekMatky);
  }
});

const row = (year: number, tfr: number | null) => ({ year, tfr, birthRate: null, motherAge: null, flags: {} });
const uneven: CountrySeries[] = [
  { code: 'SK', rows: [row(2022, 1.5), row(2023, 1.4), row(2024, 1.3)] },
  { code: 'CZ', rows: [row(2022, 1.4), row(2023, null), row(2024, null)] }
];
test('ranks at a shared observed year rather than mixing latest years or treating gaps as zero', () => {
  expect(latestCommonYear('tfr', ['SK', 'CZ'], uneven)).toBe(2022);
  expect(comparisonRanking('tfr', ['SK', 'CZ'], uneven)).toEqual({
    year: 2022, entries: [{ code: 'SK', value: 1.5, flag: '' }, { code: 'CZ', value: 1.4, flag: '' }]
  });
  expect(latestCommonYear('tfr', ['SK'], uneven)).toBe(2024);
  expect(latestCommonYear('tfr', [], uneven)).toBeNull();
  expect(latestCommonYear('motherAge', ['SK', 'CZ'], uneven)).toBeNull();
});
