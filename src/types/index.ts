import type { LucideIcon } from 'lucide-react';

export type NavItemId =
  | 'overview'
  | 'grid-regions'
  | 'meter-intelligence'
  | 'fl-lab'
  | 'experiments'
  | 'privacy-security'
  | 'drift-health'
  | 'investigations'
  | 'reports'
  | 'data-sources'
  | 'settings';

export type NavSection =
  | 'OVERVIEW'
  | 'FEDERATED INTELLIGENCE'
  | 'TRUST & MONITORING'
  | 'SYSTEM';

export interface NavItem {
  id: NavItemId;
  label: string;
  shortLabel?: string;
  section: NavSection;
  icon: LucideIcon;
  badge?: string;
  description: string;
}

export interface GridRegionSummary {
  code: 'NR' | 'WR' | 'SR' | 'ER' | 'NER';
  name: string;
  discomCount: number;
  simulatedStatus: 'optimal' | 'syncing' | 'alert' | 'standby';
  dpEpsilon: number;
  lastRound: number;
}

export interface SystemStatus {
  simulatedEnvironment: string;
  engineVersion: string;
  privacyGuarantee: string;
  activeRound: number;
  edgeNodesOnline: number;
  totalEdgeNodes: number;
  isSimulatedOnly: boolean;
}
