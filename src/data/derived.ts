import { birthData, BirthDataType } from './birthData';

export const nf = new Intl.NumberFormat('sk-SK');
export const dec = (v: number, digits = 1) =>
  v.toLocaleString('sk-SK', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const REPLACEMENT_TFR = 2.1;

export const byYear = (year: number): BirthDataType => {
  const row = birthData.find(d => d.rok === year);
  if (!row) throw new Error(`No data for ${year}`);
  return row;
};

export const first = birthData[0];
export const latest = birthData[birthData.length - 1];
export const peak = birthData.reduce((a, b) => (b.zivonarodeni > a.zivonarodeni ? b : a));
export const dropFromPeak = Math.round((1 - latest.zivonarodeni / peak.zivonarodeni) * 100);

export const latestWithTfr = [...birthData].reverse().find(d => d.tfr !== null)!;
export const latestWithAge = [...birthData].reverse().find(d => d.vekMatky !== null)!;
export const youngestMotherYear = birthData
  .filter(d => d.vekMatky !== null)
  .reduce((a, b) => (b.vekMatky! < a.vekMatky! ? b : a));

// First year from which TFR stays below replacement level until the latest data.
export const belowReplacementSince = (() => {
  let year = latestWithTfr.rok;
  for (let i = birthData.length - 1; i >= 0; i--) {
    const d = birthData[i];
    if (d.tfr === null) continue;
    if (d.tfr >= REPLACEMENT_TFR) break;
    year = d.rok;
  }
  return year;
})();

// First year of the current uninterrupted streak in which deaths exceed births.
export const naturalDecreaseSince = (() => {
  let year = latest.rok + 1;
  for (let i = birthData.length - 1; i >= 0; i--) {
    const d = birthData[i];
    if (d.umrtia <= d.zivonarodeni) break;
    year = d.rok;
  }
  return year;
})();

export const naturalChangeLatest = latest.zivonarodeni - latest.umrtia;
