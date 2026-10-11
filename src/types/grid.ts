export type GridRegionCode = 'NR' | 'WR' | 'SR' | 'ER' | 'NER';

export type NodeRiskLevel = 'optimal' | 'syncing' | 'warning' | 'alert';

export interface GridNode {
  id: string;
  name: string;
  code: string;
  region: GridRegionCode;
  regionName: string;
  lat: number;
  lng: number;
  type: 'regional-hub' | 'discom-cluster' | 'hvdc-terminal' | 'renewable-park';
  simulatedRisk: NodeRiskLevel;
  activeDiscoms: number;
  simulatedLoadGW: number;
  dpEpsilon: number;
  anomalyScore: number;
  voltageKV: number;
  details: string;
}

export interface TransmissionCorridor {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  voltageKV: 765 | 400 | 800;
  type: 'AC-Synchronous' | 'HVDC-Bipole';
  capacityGW: number;
  status: 'optimal' | 'congested' | 'syncing';
}

export interface StateGeomProperties {
  name: string;
  shapeName: string;
  shapeISO?: string;
  region: GridRegionCode;
  simulatedStatus: NodeRiskLevel;
  primaryDiscom: string;
  simulatedMetersTracked: number;
  dpGuaranteed: boolean;
}

export interface HoveredEntity {
  type: 'node' | 'state' | 'corridor';
  id: string;
  title: string;
  subtitle: string;
  region: GridRegionCode;
  status: NodeRiskLevel;
  metrics: { label: string; value: string }[];
  x: number;
  y: number;
}
