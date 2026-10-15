
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectAnomalies,
  exportAnomalyResults,
} from '../src/services/anomalyDetection.ts';

const baseTime = Date.parse('2026-10-01T00:00:00Z');

function readings(values, meterId = 'MTR-TEST') {
  return values.map((consumption, index) => ({
    meterId,
    clientId: 'CLIENT-TEST',
    region: 'Test',
    timestamp: new Date(baseTime + index * 60 * 60 * 1000).toISOString(),
    consumption,
    unit: 'kWh',
  }));
}

describe('Smart meter anomaly detection', () => {
  it('detects unusually high consumption', () => {
    const result = detectAnomalies(
      readings([1, 1.1, 0.9, 1, 1.1, 1, 8]),
    );

    assert.equal(result[6].category, 'high-consumption');
    assert.ok(result[6].anomalyScore > 0);
  });

  it('marks a missing reading', () => {
    const result = detectAnomalies(
      readings([1, 1.1, null]),
    );

    assert.equal(result[2].qualityStatus, 'missing');
    assert.equal(result[2].anomalyScore, null);
  });

  it('marks a negative consumption reading as invalid', () => {
    const result = detectAnomalies(readings([-2]));

    assert.equal(result[0].qualityStatus, 'invalid');
  });

  it('marks an inconsistent unit', () => {
    const input = readings([1]);
    input[0].unit = 'Wh';

    const result = detectAnomalies(input);

    assert.equal(result[0].qualityStatus, 'inconsistent-unit');
  });

  it('marks duplicate meter timestamps', () => {
    const input = readings([1, 1.2]);
    input[1].timestamp = input[0].timestamp;

    const result = detectAnomalies(input);

    assert.equal(result[1].qualityStatus, 'duplicate');
  });

  it('produces reproducible results', () => {
    const input = readings([1, 1.1, 0.9, 1, 1.1, 1, 8]);

    assert.deepEqual(
      detectAnomalies(input),
      detectAnomalies(input),
    );
  });

  it('exports valid JSON', () => {
    const result = detectAnomalies(readings([1, 1.1, 0.9]));
    const exported = exportAnomalyResults(result);

    assert.deepEqual(JSON.parse(exported), result);
  });
});
