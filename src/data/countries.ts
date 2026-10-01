import snapshot from './countries.json';

export type CountryCode = 'SK' | 'CZ' | 'PL' | 'HU' | 'EU27_2020';
export type ComparisonMetric = 'tfr' | 'birthRate' | 'motherAge';
export interface CountryRow {
  year: number;
  tfr: number | null;
  birthRate: number | null;
  motherAge: number | null;
  flags: Partial<Record<ComparisonMetric, string>>;
}
export interface CountrySeries { code: CountryCode; rows: CountryRow[]; }
export const countrySeries: CountrySeries[] = snapshot.countries as CountrySeries[];
export const countrySources = snapshot.sources;
export const countryDownloadedOn = snapshot.downloadedOn;
export const COUNTRIES: { code: CountryCode; name: string; color: string; dash?: string }[] = [
  { code: 'SK', name: 'Slovensko', color: '#b6f24a' },
  { code: 'CZ', name: 'Česko', color: '#8b9bff', dash: '8 3' },
  { code: 'PL', name: 'Poľsko', color: '#ffb454', dash: '3 3' },
  { code: 'HU', name: 'Maďarsko', color: '#5eead4', dash: '10 3 2 3' },
  { code: 'EU27_2020', name: 'EÚ (27)', color: '#d0d3d9', dash: '6 5' }
];

export function latestCommonYear(
  metric: ComparisonMetric, codes: CountryCode[], series: CountrySeries[] = countrySeries
): number | null {
  if (codes.length === 0) return null;
  const selected = codes.map(code => series.find(country => country.code === code));
  if (selected.some(country => !country)) return null;
  const years = selected[0]!.rows.map(row => row.year).sort((a, b) => b - a);
  return years.find(year => selected.every(country =>
    country!.rows.some(row => row.year === year && row[metric] !== null))) ?? null;
}

export function comparisonRanking(metric: ComparisonMetric, codes: CountryCode[], series = countrySeries) {
  const year = latestCommonYear(metric, codes, series);
  if (year === null) return { year, entries: [] };
  const entries = codes.map(code => {
    const row = series.find(country => country.code === code)!.rows.find(row => row.year === year)!;
    return { code, value: row[metric]!, flag: row.flags[metric] ?? '' };
  }).sort((a, b) => b.value - a.value || codes.indexOf(a.code) - codes.indexOf(b.code));
  return { year, entries };
}

export function comparisonRows(metric: ComparisonMetric, series = countrySeries) {
  const years = Array.from(new Set(series.flatMap(country => country.rows.map(row => row.year)))).sort((a, b) => a - b);
  return years.map(year => ({
    year, ...Object.fromEntries(series.map(country => [
      country.code, country.rows.find(row => row.year === year)?.[metric] ?? null
    ]))
  })) as ({ year: number } & Record<CountryCode, number | null>)[];
}

export const describeFlag = (flag: string) => {
  const labels: Record<string, string> = { b: 'zlom v časovom rade', e: 'odhad', p: 'predbežný údaj' };
  return flag.split('').map(code => labels[code] ?? 'označenie Eurostatu: ' + code).join(', ');
};
