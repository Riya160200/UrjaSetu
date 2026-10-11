import {
  Activity,
  Network,
  Gauge,
  Share2,
  FlaskConical,
  ShieldCheck,
  HeartPulse,
  SearchCheck,
  FileText,
  Database,
  Sliders,
} from 'lucide-react';
import type { NavItem } from '../types';

export const NAV_ITEMS: NavItem[] = [
  // 1. OVERVIEW
  {
    id: 'overview',
    label: 'National Overview',
    shortLabel: 'Overview',
    section: 'OVERVIEW',
    icon: Activity,
    description: 'National Grid command overview and real-time mesh monitoring',
  },
  {
    id: 'grid-regions',
    label: 'Grid Regions',
    shortLabel: 'Regions',
    section: 'OVERVIEW',
    icon: Network,
    badge: '5 Grids',
    description: 'Northern, Western, Southern, Eastern, and North-Eastern regional topologies',
  },
  {
    id: 'meter-intelligence',
    label: 'Meter Intelligence',
    shortLabel: 'Meters',
    section: 'OVERVIEW',
    icon: Gauge,
    description: 'Smart meter streaming telemetry & anomaly inference',
  },

  // 2. FEDERATED INTELLIGENCE
  {
    id: 'fl-lab',
    label: 'Federated Learning',
    shortLabel: 'FL Engine',
    section: 'FEDERATED INTELLIGENCE',
    icon: Share2,
    badge: 'Round 48',
    description: 'Decentralized parameter aggregation & round coordinator',
  },
  {
    id: 'experiments',
    label: 'Experiments & Evaluation',
    shortLabel: 'Experiments',
    section: 'FEDERATED INTELLIGENCE',
    icon: FlaskConical,
    description: 'Model benchmark runs, loss curves & validation sweeps',
  },

  // 3. TRUST & MONITORING
  {
    id: 'privacy-security',
    label: 'Privacy & Security',
    shortLabel: 'Privacy',
    section: 'TRUST & MONITORING',
    icon: ShieldCheck,
    badge: 'ε=1.28',
    description: 'Differential privacy budgets & Secure Multi-Party Aggregation',
  },
  {
    id: 'drift-health',
    label: 'Drift & Model Health',
    shortLabel: 'Drift',
    section: 'TRUST & MONITORING',
    icon: HeartPulse,
    description: 'Non-IID distribution shifts, concept drift & node health',
  },
  {
    id: 'investigations',
    label: 'Investigations',
    shortLabel: 'Forensics',
    section: 'TRUST & MONITORING',
    icon: SearchCheck,
    description: 'Tamper-evident anomaly forensics & DISCOM audit logs',
  },
  {
    id: 'reports',
    label: 'Reports',
    shortLabel: 'Reports',
    section: 'TRUST & MONITORING',
    icon: FileText,
    description: 'Automated executive summaries and compliance exports',
  },

  // 4. SYSTEM
  {
    id: 'data-sources',
    label: 'Data Sources',
    shortLabel: 'Sources',
    section: 'SYSTEM',
    icon: Database,
    description: 'Synthetic DISCOM connectors & test stream schemas',
  },
  {
    id: 'settings',
    label: 'Settings',
    shortLabel: 'Settings',
    section: 'SYSTEM',
    icon: Sliders,
    description: 'Platform topology, node certificates & display prefs',
  },
];
