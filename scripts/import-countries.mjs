/**
 * Refresh R1 country comparison: node scripts/import-countries.mjs
 * Node 22+, standard library only. Writes a static snapshot; no runtime requests.
 * Source format: https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started
 * All non-time dimensions must match one requested series. Missing values stay null.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const COUNTRY_CODES = ['SK', 'CZ', 'PL', 'HU', 'EU27_2020'];
export const METRICS = {
  tfr: { dataset: 'demo_find', indicator: 'TOTFERRT' },
  birthRate: { dataset: 'demo_gind', indicator: 'GBIRTHRT' },
  motherAge: { dataset: 'demo_find', indicator: 'AGEMOTH' }
};

export function parseSeries(data, geo, indicator) {
  if (data.class !== 'dataset' || data.version !== '2.0' || !Array.isArray(data.id)) {
    throw new Error('Expected a JSON-stat 2.0 dataset');
  }
  const timeAxis = data.id.indexOf('time');
  if (timeAxis < 0 || data.id.length !== data.size?.length) throw new Error('Invalid dimensions');
  for (const [axis, name] of data.id.entries()) {
    if (name !== 'time' && data.size[axis] !== 1) throw new Error('Ambiguous series: ' + name);
  }
  for (const [dimension, expected] of Object.entries({ freq: 'A', geo, indic_de: indicator })) {
    const keys = Object.keys(data.dimension?.[dimension]?.category?.index ?? {});
    if (keys.length !== 1 || keys[0] !== expected) throw new Error('Unexpected ' + dimension);
  }
  const timeIndex = data.dimension.time.category.index;
  const entries = Array.isArray(timeIndex) ? timeIndex.map((year, i) => [year, i]) : Object.entries(timeIndex);
  if (entries.length !== data.size[timeAxis]) throw new Error('Invalid time index');
  const stride = data.size.slice(timeAxis + 1).reduce((a, b) => a * b, 1);
  const rows = entries.map(([label, position]) => {
    const year = Number(label);
    if (!/^\d{4}$/.test(label) || !Number.isInteger(position) || position < 0 || position >= entries.length) {
      throw new Error('Invalid annual observation');
    }
    const index = position * stride;
    const value = data.value?.[index] ?? null;
    if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0)) {
      throw new Error('Invalid numeric value');
    }
    return { year, value, flag: data.status?.[index] ?? '' };
  }).sort((a, b) => a.year - b.year);
  if (new Set(rows.map(r => r.year)).size !== rows.length ||
      new Set(entries.map(([, position]) => position)).size !== entries.length) {
    throw new Error('Duplicate observation');
  }
  if (!rows.some(r => r.value !== null)) throw new Error('Empty series');
  return rows;
}

export async function refreshCountries() {
  const sources = [];
  const observations = new Map(COUNTRY_CODES.map(code => [code, new Map()]));
  // Three small requests per country at a time, rather than downloading whole datasets.
  for (const code of COUNTRY_CODES) {
    const results = await Promise.all(Object.entries(METRICS).map(async ([metric, spec]) => {
      const url = new URL('https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/' + spec.dataset);
      url.search = new URLSearchParams({ freq: 'A', geo: code, indic_de: spec.indicator,
        sinceTimePeriod: '1960', format: 'JSON', lang: 'EN' });
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(code + ' ' + metric + ': HTTP ' + response.status);
      const data = await response.json();
      return { metric, rows: parseSeries(data, code, spec.indicator),
        source: { country: code, metric, url: url.href, updated: data.updated, label: data.label } };
    }));
    for (const { metric, rows, source } of results) {
      sources.push(source);
      for (const observation of rows) {
        if (observation.year < 1960) continue;
        const row = observations.get(code).get(observation.year) ?? {
          year: observation.year, tfr: null, birthRate: null, motherAge: null, flags: {}
        };
        row[metric] = observation.value;
        if (observation.flag) row.flags[metric] = observation.flag;
        observations.get(code).set(observation.year, row);
      }
    }
  }
  const lastYear = Math.max(...[...observations.values()].flatMap(rows =>
    [...rows.values()].filter(row => Object.keys(METRICS).some(key => row[key] !== null)).map(row => row.year)));
  const countries = COUNTRY_CODES.map(code => ({
    code,
    rows: Array.from({ length: lastYear - 1960 + 1 }, (_, i) => observations.get(code).get(1960 + i) ?? {
      year: 1960 + i, tfr: null, birthRate: null, motherAge: null, flags: {}
    })
  }));
  const path = new URL('../src/data/countries.json', import.meta.url);
  const previous = await readFile(path, 'utf8').then(JSON.parse).catch(error => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  const payload = { downloadedOn: new Date().toISOString().slice(0, 10), sources, countries };
  // Keep the download date when the data and source metadata have not changed.
  if (previous && JSON.stringify(previous.sources) === JSON.stringify(sources) &&
      JSON.stringify(previous.countries) === JSON.stringify(countries)) payload.downloadedOn = previous.downloadedOn;
  await writeFile(path, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  for (const country of countries) {
    console.log(country.code + ': ' + country.rows.length + ' annual rows, through ' + lastYear);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  refreshCountries().catch(error => { console.error(error.message); process.exitCode = 1; });
}
