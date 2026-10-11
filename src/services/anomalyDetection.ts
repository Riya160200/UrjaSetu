
import type {
  AnomalyCategory,
  AnomalyEvidence,
  AnomalyResult,
  MeterReading,
  MeterQualityStatus,
} from '../types/meter';

export const MODEL_VERSION = 'robust-baseline-v1';

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function qualityOf(
  reading: MeterReading,
  duplicate: boolean,
): MeterQualityStatus {
  if (
    reading.consumption === null ||
    !Number.isFinite(reading.consumption)
  ) {
    return 'missing';
  }

  if (duplicate) return 'duplicate';

  if (
    reading.consumption < 0 ||
    !reading.meterId.trim() ||
    !reading.clientId.trim() ||
    Number.isNaN(Date.parse(reading.timestamp))
  ) {
    return 'invalid';
  }

  if (reading.unit !== 'kWh') return 'inconsistent-unit';

  return 'valid';
}

/**
 * Uses previous valid readings from the same meter as a baseline.
 * This is a statistical baseline, not a trained ML model.
 */
export function detectAnomalies(
  readings: MeterReading[],
): AnomalyResult[] {
  const seen = new Set<string>();
  const historyByMeter = new Map<string, number[]>();

  // Keep the original output order while processing readings by time.
  const prepared = readings.map((reading, index) => ({
    reading,
    index,
  }));

  const results: AnomalyResult[] = new Array(readings.length);

  prepared.sort((a, b) => {
    const timeA = Date.parse(a.reading.timestamp);
    const timeB = Date.parse(b.reading.timestamp);

    if (Number.isNaN(timeA)) return 1;
    if (Number.isNaN(timeB)) return -1;

    return timeA - timeB || a.index - b.index;
  });

  for (const { reading, index } of prepared) {
    const key = `${reading.meterId}|${reading.timestamp}`;
    const duplicate = seen.has(key);
    seen.add(key);

    const quality = qualityOf(reading, duplicate);
    const value = reading.consumption;
    const evidence: AnomalyEvidence[] = [];

    let score: number | null = null;
    let category: AnomalyCategory = 'insufficient-data';

    if (quality !== 'valid') {
      evidence.push({
        code: `quality-${quality}`,
        message: `Reading requires data-quality review: ${quality}.`,
        observedValue: value,
        expectedValue: null,
      });
    } else if (value !== null) {
      // Only use earlier valid readings for this meter.
      const history = historyByMeter.get(reading.meterId) ?? [];

      if (history.length >= 4) {
        const center = median(history);
        const deviations = history.map(
          (previous) => Math.abs(previous - center),
        );
        const mad = median(deviations);
        const scale = Math.max(1.4826 * mad, 0.1);

        const robustZ = Math.abs(value - center) / scale;
        score = Math.min(robustZ / 6, 1);

        if (robustZ >= 3.5) {
          category =
            value > center ? 'high-consumption' : 'low-consumption';

          evidence.push({
            code: 'robust-deviation',
            message:
              `Consumption differs substantially from the previous ` +
              `meter baseline (robust z-score ${robustZ.toFixed(2)}).`,
            observedValue: value,
            expectedValue: center,
          });
        } else {
          category = 'normal';
        }
      }

      // Add this reading only after scoring it.
      history.push(value);
      historyByMeter.set(reading.meterId, history);
    }

    results[index] = {
      meterId: reading.meterId,
      clientId: reading.clientId,
      region: reading.region,
      timestamp: reading.timestamp,
      consumption: value,
      unit: reading.unit,
      qualityStatus: quality,
      anomalyScore: score,
      category,
      evidence,
      modelVersion: MODEL_VERSION,
      isSimulated: true,
    };
  }

  return results;
}

export function exportAnomalyResults(
  results: AnomalyResult[],
): string {
  return JSON.stringify(results, null, 2);
}
