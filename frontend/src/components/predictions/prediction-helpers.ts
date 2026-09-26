import { Flame, Activity, FileSearch } from 'lucide-react';
import type { LogSeverity } from '@/types';

export function formatAttackTypeName(raw: string): string {
  if (!raw) return 'Unknown Scenario';
  return raw
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getMitreTechnique(attackType: string): { id: string; name: string; tactic: string } {
  const norm = (attackType || '').toUpperCase();
  if (norm.includes('BRUTE') || norm.includes('PASSWORD') || norm.includes('CREDENTIAL')) {
    return { id: 'T1110', name: 'Brute Force', tactic: 'Credential Access' };
  }
  if (norm.includes('DDOS') || norm.includes('DOS') || norm.includes('FLOOD')) {
    return { id: 'T1498', name: 'Network Denial of Service', tactic: 'Impact' };
  }
  if (norm.includes('EXFILTRATION') || norm.includes('DATA_LEAK') || norm.includes('LEAK')) {
    return { id: 'T1048', name: 'Exfiltration Over Web Service', tactic: 'Exfiltration' };
  }
  if (norm.includes('SCAN') || norm.includes('RECON') || norm.includes('PROBE')) {
    return { id: 'T1595', name: 'Active Scanning', tactic: 'Reconnaissance' };
  }
  if (norm.includes('MALWARE') || norm.includes('RANSOMWARE') || norm.includes('EXECUTION')) {
    return { id: 'T1204', name: 'User Execution / Malware', tactic: 'Execution' };
  }
  if (norm.includes('SQL') || norm.includes('INJECTION')) {
    return { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access' };
  }
  return { id: 'T1078', name: 'Valid Accounts / Anomalous Sequence', tactic: 'Initial Access' };
}

export function getLikelihoodDescriptor(prob: number): { label: string; tone: string } {
  const pct = Math.round(prob * 100);
  if (pct >= 80) return { label: 'Imminent / High Probability', tone: 'text-rose-400' };
  if (pct >= 60) return { label: 'Elevated Risk / Likely', tone: 'text-orange-400' };
  if (pct >= 40) return { label: 'Moderate Possibility', tone: 'text-amber-400' };
  return { label: 'Low Precursor Signal', tone: 'text-emerald-400' };
}

export function getConfidenceDescriptor(conf: number): string {
  const pct = Math.round(conf * 100);
  if (pct >= 80) return 'High Confidence';
  if (pct >= 50) return 'Moderate Confidence';
  return 'Early Low-Confidence Correlation';
}

export function getSeverityBadgeVariant(
  severity: LogSeverity
): 'destructive' | 'warning' | 'default' | 'success' {
  switch (severity) {
    case 'CRITICAL':
      return 'destructive';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'default';
    case 'LOW':
      return 'success';
    default:
      return 'default';
  }
}

export type TremorColor = 'red' | 'orange' | 'amber' | 'emerald' | 'cyan' | 'blue';

export function getTremorSeverityColor(severity: LogSeverity): TremorColor {
  switch (severity) {
    case 'CRITICAL':
      return 'red';
    case 'HIGH':
      return 'orange';
    case 'MEDIUM':
      return 'amber';
    case 'LOW':
      return 'emerald';
    default:
      return 'cyan';
  }
}

export const SIMULATION_PRESETS = [
  {
    id: 'brute_force',
    name: 'Brute Force Surge',
    desc: 'High-velocity credential authentication failures across perimeter gateways',
    icon: Flame,
    logs: [
      {
        sourceIp: '198.51.100.44',
        destinationIp: '10.0.0.15',
        destinationPort: 22,
        protocol: 'TCP',
        action: 'DENY',
        severity: 'CRITICAL',
        source: 'FIREWALL',
        eventType: 'LOGIN_FAILURE',
        message: 'Repeated authentication failure for user root',
      },
      {
        sourceIp: '198.51.100.44',
        destinationIp: '10.0.0.15',
        destinationPort: 22,
        protocol: 'TCP',
        action: 'DENY',
        severity: 'CRITICAL',
        source: 'FIREWALL',
        eventType: 'LOGIN_FAILURE',
        message: 'Dictionary password guess attempt detected',
      },
      {
        sourceIp: '198.51.100.44',
        destinationIp: '10.0.0.15',
        destinationPort: 22,
        protocol: 'TCP',
        action: 'DENY',
        severity: 'HIGH',
        source: 'FIREWALL',
        eventType: 'LOGIN_FAILURE',
        message: 'Threshold breach: >25 failed attempts in 60s',
      },
    ],
  },
  {
    id: 'ddos',
    name: 'DDoS Recon Buildup',
    desc: 'Multi-source connection flooding with elevated drops on border routers',
    icon: Activity,
    logs: [
      {
        sourceIp: '203.0.113.88',
        destinationIp: '10.0.0.50',
        destinationPort: 443,
        protocol: 'TCP',
        action: 'DROP',
        severity: 'HIGH',
        source: 'FIREWALL',
        eventType: 'CONNECTION_ATTEMPT',
        message: 'TCP SYN flood signature on ingress border gateway',
      },
      {
        sourceIp: '198.18.0.99',
        destinationIp: '10.0.0.50',
        destinationPort: 443,
        protocol: 'TCP',
        action: 'DROP',
        severity: 'HIGH',
        source: 'FIREWALL',
        eventType: 'CONNECTION_ATTEMPT',
        message: 'Abnormal volumetric request spike detected',
      },
    ],
  },
  {
    id: 'data_leak',
    name: 'Off-Hours Exfiltration',
    desc: 'Bulk file downloads during non-operational hours via encrypted channels',
    icon: FileSearch,
    logs: [
      {
        sourceIp: '10.0.12.80',
        destinationIp: '198.51.100.120',
        destinationPort: 443,
        protocol: 'HTTPS',
        action: 'ALLOW',
        severity: 'HIGH',
        source: 'APPLICATION',
        eventType: 'DATA_TRANSFER',
        message: 'Large volume export query executed outside business hours (02:14 UTC)',
      },
    ],
  },
];
