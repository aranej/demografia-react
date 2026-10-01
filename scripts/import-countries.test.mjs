import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSeries } from './import-countries.mjs';

const fixture = () => ({
  class: 'dataset', version: '2.0', id: ['freq', 'time', 'geo', 'indic_de'], size: [1, 3, 1, 1],
  dimension: {
    freq: { category: { index: { A: 0 } } },
    geo: { category: { index: { SK: 0 } } },
    indic_de: { category: { index: { TOTFERRT: 0 } } },
    time: { category: { index: { '2022': 0, '2023': 1, '2024': 2 } } }
  }, value: { 0: 1.6, 2: 0 }, status: { 0: 'ep' }
});
test('maps annual positions even when time is not the last dimension; preserves zero, gaps and flags', () => {
  assert.deepEqual(parseSeries(fixture(), 'SK', 'TOTFERRT'), [
    { year: 2022, value: 1.6, flag: 'ep' }, { year: 2023, value: null, flag: '' },
    { year: 2024, value: 0, flag: '' }
  ]);
});
test('rejects a multi-series response instead of silently mixing countries', () => {
  const data = fixture(); data.size[2] = 2;
  assert.throws(() => parseSeries(data, 'SK', 'TOTFERRT'), /Ambiguous/);
});
test('rejects the wrong geography and invalid values', () => {
  assert.throws(() => parseSeries(fixture(), 'PL', 'TOTFERRT'), /Unexpected geo/);
  const data = fixture(); data.value[0] = '1.6';
  assert.throws(() => parseSeries(data, 'SK', 'TOTFERRT'), /numeric/);
});
test('rejects empty responses and duplicate positions', () => {
  const data = fixture(); data.value = {};
  assert.throws(() => parseSeries(data, 'SK', 'TOTFERRT'), /Empty/);
  data.value = { 0: 1.6 }; data.dimension.time.category.index['2024'] = 0;
  assert.throws(() => parseSeries(data, 'SK', 'TOTFERRT'), /Duplicate/);
});
