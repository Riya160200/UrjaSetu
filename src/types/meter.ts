
export type ConsumptionUnit = 'kWh';

export type MeterQualityStatus =
  | 'valid'
  | 'missing'
  | 'duplicate'
  | 'invalid'
  | 'inconsistent-unit';

export type AnomalyCategory =
  | 'normal'
  | 'high-consumption'
  | 'low-consumption'
  | 'sudden-change'
  | 'insufficient-data';

export interface MeterReading {
  meterId: string;
  clientId: string;
  region: string;
  timestamp: string;
  consumption: number | null;
  unit: ConsumptionUnit | string;
  qualityStatus?: MeterQualityStatus;
}

export interface MeterFeature {
  readingCount: number;
  meanConsumption: number;
  medianConsumption: number;
  standardDeviation: number;
  previousConsumption: number | null;
  percentageChange: number | null;
}

export interface AnomalyEvidence {
  code: string;
  message: string;
  observedValue: number | null;
  expectedValue: number | null;
}

export interface AnomalyResult {
  meterId: string;
  clientId: string;
  region: string;
  timestamp: string;
  consumption: number | null;
  unit: string;
  qualityStatus: MeterQualityStatus;
  anomalyScore: number | null;
  category: AnomalyCategory;
  evidence: AnomalyEvidence[];
  modelVersion: string;
  isSimulated: boolean;
}

export interface AnomalyEvaluation {
  evaluatedAt: string;
  modelVersion: string;
  inputCount: number;
  validCount: number;
  invalidCount: number;
  anomalyCount: number;
  labeledCount?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
}
