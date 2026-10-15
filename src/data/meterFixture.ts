
import type { MeterReading } from '../types/meter';

// Deterministic demo readings — simulated, not live smart-meter data.
const START = Date.parse('2026-10-01T00:00:00Z');

function makeReadings(
  meterId: string,
  clientId: string,
  region: string,
  values: number[],
): MeterReading[] {
  return values.map((consumption, index) => ({
    meterId,
    clientId,
    region,
    timestamp: new Date(START + index * 60 * 60 * 1000).toISOString(),
    consumption,
    unit: 'kWh',
  }));
}

export const METER_FIXTURE: MeterReading[] = [
  ...makeReadings('MTR-1001', 'DISCOM-NR-01', 'Northern', [
    1.8, 1.9, 1.7, 1.8, 1.9, 1.8, 2.0, 1.9,
    1.8, 1.7, 1.9, 1.8, 1.9, 1.8, 1.7, 1.9,
    1.8, 1.9, 1.8, 1.7, 1.9, 1.8, 1.9, 1.8,
  ]),
  ...makeReadings('MTR-1002', 'DISCOM-WR-01', 'Western', [
    2.1, 2.0, 2.2, 2.1, 2.0, 2.2, 2.1, 2.0,
    2.1, 2.2, 2.0, 2.1, 2.2, 2.0, 2.1, 2.2,
    2.0, 2.1, 2.2, 2.0, 2.1, 2.2, 2.0, 9.5,
  ]),
  ...makeReadings('MTR-1003', 'DISCOM-SR-01', 'Southern', [
    0.9, 1.0, 0.9, 1.1, 1.0, 0.9, 1.0, 1.1,
    1.0, 0.9, 1.0, 1.1, 0.9, 1.0, 1.1, 1.0,
    0.9, 1.0, 1.1, 0.9, 1.0, 1.1, 1.0, 0.9,
  ]),
];
