import type {
  DashboardStats,
  ThreatTrendPoint,
  SeverityDistribution,
  AttackFrequency,
  TopSource,
  RecentActivity,
  SecurityLog,
  Alert,
  ThreatEntity,
  ThreatAnalysisSummary,
} from '@/types';

// ==================== Dashboard Stats ====================
export const mockDashboardStats: DashboardStats = {
  totalLogs: 1248563,
  totalAlerts: 3847,
  criticalAlerts: 23,
  highRiskUsers: 156,
  blockedIps: 8942,
  avgThreatScore: 67.3,
};

// ==================== Threat Trend (30 days) ====================
export const mockThreatTrend: ThreatTrendPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    threats: Math.floor(Math.random() * 300) + 100,
    blocked: Math.floor(Math.random() * 250) + 80,
    allowed: Math.floor(Math.random() * 50) + 20,
  };
});

// ==================== Severity Distribution ====================
export const mockSeverityDistribution: SeverityDistribution[] = [
  { name: 'Critical', value: 23, color: '#ef4444' },
  { name: 'High', value: 187, color: '#f97316' },
  { name: 'Medium', value: 892, color: '#eab308' },
  { name: 'Low', value: 2745, color: '#22c55e' },
];

// ==================== Attack Frequency ====================
export const mockAttackFrequency: AttackFrequency[] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toISOString().split('T')[0],
    bruteForce: Math.floor(Math.random() * 80) + 20,
    malware: Math.floor(Math.random() * 60) + 10,
    phishing: Math.floor(Math.random() * 40) + 5,
    ddos: Math.floor(Math.random() * 30) + 5,
    other: Math.floor(Math.random() * 20) + 5,
  };
});

// ==================== Top Sources ====================
export const mockTopSources: TopSource[] = [
  { ip: '185.220.101.34', country: 'Russia', count: 4523, threatLevel: 'CRITICAL' },
  { ip: '45.33.32.156', country: 'China', count: 3891, threatLevel: 'CRITICAL' },
  { ip: '103.224.182.250', country: 'China', count: 2847, threatLevel: 'HIGH' },
  { ip: '91.240.118.172', country: 'Ukraine', count: 2156, threatLevel: 'HIGH' },
  { ip: '185.56.83.84', country: 'Netherlands', count: 1893, threatLevel: 'HIGH' },
  { ip: '45.155.205.233', country: 'Germany', count: 1567, threatLevel: 'MEDIUM' },
  { ip: '192.241.214.87', country: 'USA', count: 1234, threatLevel: 'MEDIUM' },
  { ip: '178.128.220.21', country: 'Singapore', count: 987, threatLevel: 'MEDIUM' },
  { ip: '159.89.173.104', country: 'India', count: 756, threatLevel: 'LOW' },
  { ip: '68.183.44.143', country: 'USA', count: 543, threatLevel: 'LOW' },
];

// ==================== Recent Activity ====================
export const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    type: 'BRUTE_FORCE',
    severity: 'CRITICAL',
    message: 'Multiple failed SSH login attempts detected from 185.220.101.34',
    sourceIp: '185.220.101.34',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    type: 'MALWARE',
    severity: 'HIGH',
    message: 'Suspicious executable download blocked on endpoint WS-0847',
    sourceIp: '45.33.32.156',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    type: 'ANOMALY',
    severity: 'HIGH',
    message: 'Unusual data transfer volume detected from internal IP 10.0.5.42',
    sourceIp: '10.0.5.42',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 450000).toISOString(),
    type: 'PHISHING',
    severity: 'MEDIUM',
    message: 'Phishing email detected and quarantined — targeting finance team',
    sourceIp: '91.240.118.172',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    type: 'POLICY_VIOLATION',
    severity: 'LOW',
    message: 'User jsmith accessed restricted resource outside business hours',
    sourceIp: '10.0.2.15',
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    type: 'DDOS',
    severity: 'CRITICAL',
    message: 'DDoS attack mitigated — 2.3Gbps volumetric attack from botnet',
    sourceIp: '103.224.182.250',
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    type: 'UNAUTHORIZED_ACCESS',
    severity: 'HIGH',
    message: 'Privilege escalation attempt detected on server DB-PROD-01',
    sourceIp: '10.0.8.99',
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 1500000).toISOString(),
    type: 'MALWARE',
    severity: 'MEDIUM',
    message: 'C2 beacon communication blocked to known malicious domain',
    sourceIp: '185.56.83.84',
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    type: 'ANOMALY',
    severity: 'LOW',
    message: 'DNS query spike detected — possible tunneling attempt',
    sourceIp: '10.0.3.27',
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    type: 'BRUTE_FORCE',
    severity: 'MEDIUM',
    message: 'RDP brute force attempt blocked after 15 failed attempts',
    sourceIp: '45.155.205.233',
  },
  {
    id: '11',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    type: 'DATA_EXFILTRATION',
    severity: 'CRITICAL',
    message: 'Large data upload to cloud storage detected from restricted zone',
    sourceIp: '10.0.12.45',
  },
  {
    id: '12',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'PHISHING',
    severity: 'HIGH',
    message: 'Spear phishing campaign targeting C-suite executives detected',
    sourceIp: '178.128.220.21',
  },
];

// ==================== Security Logs ====================
const logSeverities: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const logActions: Array<'ALLOW' | 'DENY' | 'DROP' | 'ALERT' | 'BLOCK'> = ['ALLOW', 'DENY', 'DROP', 'ALERT', 'BLOCK'];
const logSources: Array<'FIREWALL' | 'IDS' | 'WAF' | 'ENDPOINT' | 'EMAIL' | 'DNS' | 'PROXY' | 'SIEM'> = ['FIREWALL', 'IDS', 'WAF', 'ENDPOINT', 'EMAIL', 'DNS', 'PROXY', 'SIEM'];
const logProtocols: Array<'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'DNS' | 'SSH'> = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'SSH'];
const countries = ['United States', 'China', 'Russia', 'Germany', 'Netherlands', 'Ukraine', 'Singapore', 'India', 'Brazil', 'Japan'];
const eventTypes = ['Connection Attempt', 'Port Scan', 'Login Failure', 'Malware Detected', 'Policy Violation', 'Data Transfer', 'DNS Query', 'File Access'];

function randomIp(): string {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const mockSecurityLogs: SecurityLog[] = Array.from({ length: 100 }, (_, i) => {
  const severity = randomItem(logSeverities);
  const ts = new Date(Date.now() - Math.random() * 86400000 * 7);
  return {
    id: `log-${String(i + 1).padStart(4, '0')}`,
    timestamp: ts.toISOString(),
    sourceIp: randomIp(),
    destinationIp: randomIp(),
    sourcePort: Math.floor(Math.random() * 60000) + 1024,
    destinationPort: randomItem([22, 80, 443, 3306, 8080, 8443, 53, 25]),
    protocol: randomItem(logProtocols),
    action: randomItem(logActions),
    severity,
    source: randomItem(logSources),
    eventType: randomItem(eventTypes),
    message: `${randomItem(eventTypes)} from ${randomIp()} detected by ${randomItem(logSources)}`,
    country: randomItem(countries),
    city: 'Unknown',
    latitude: null,
    longitude: null,
    userId: null,
    userName: null,
    rawData: {},
    threatScore: severity === 'CRITICAL' ? Math.floor(Math.random() * 20) + 80 : severity === 'HIGH' ? Math.floor(Math.random() * 20) + 60 : severity === 'MEDIUM' ? Math.floor(Math.random() * 20) + 40 : Math.floor(Math.random() * 30) + 10,
    isThreat: severity === 'CRITICAL' || severity === 'HIGH',
    createdAt: ts.toISOString(),
  };
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// ==================== Alerts ====================
const alertTypes: Array<'BRUTE_FORCE' | 'MALWARE' | 'PHISHING' | 'DATA_EXFILTRATION' | 'DDOS' | 'UNAUTHORIZED_ACCESS' | 'ANOMALY' | 'POLICY_VIOLATION'> = ['BRUTE_FORCE', 'MALWARE', 'PHISHING', 'DATA_EXFILTRATION', 'DDOS', 'UNAUTHORIZED_ACCESS', 'ANOMALY', 'POLICY_VIOLATION'];
const alertStatuses: Array<'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE'> = ['NEW', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'];
const analysts = ['Sarah Chen', 'Mike Rodriguez', 'Alex Kim', 'Dr. Patel', null];

const alertTitles: Record<string, string[]> = {
  BRUTE_FORCE: ['SSH Brute Force Attack Detected', 'RDP Brute Force from External IP', 'API Authentication Brute Force'],
  MALWARE: ['Ransomware Signature Detected', 'Trojan Communication Blocked', 'Cryptominer Activity on Server'],
  PHISHING: ['Spear Phishing Campaign Detected', 'Credential Harvesting Page Blocked', 'CEO Fraud Email Intercepted'],
  DATA_EXFILTRATION: ['Large Data Upload to External Cloud', 'USB Data Transfer from Restricted Host', 'Encrypted Tunnel Data Exfiltration'],
  DDOS: ['Volumetric DDoS Attack Mitigated', 'Application Layer DDoS Detected', 'DNS Amplification Attack Blocked'],
  UNAUTHORIZED_ACCESS: ['Privilege Escalation Attempt', 'Unauthorized Admin Portal Access', 'Service Account Compromise'],
  ANOMALY: ['Unusual Login Pattern Detected', 'Network Traffic Anomaly', 'Off-hours System Access'],
  POLICY_VIOLATION: ['Data Classification Violation', 'Unauthorized Software Installation', 'VPN Policy Breach'],
};

export const mockAlerts: Alert[] = Array.from({ length: 40 }, (_, i) => {
  const type = randomItem(alertTypes);
  const severity = i < 5 ? 'CRITICAL' : i < 15 ? 'HIGH' : i < 30 ? 'MEDIUM' : 'LOW';
  const status = randomItem(alertStatuses);
  const ts = new Date(Date.now() - Math.random() * 86400000 * 14);

  return {
    id: `alert-${String(i + 1).padStart(4, '0')}`,
    title: randomItem(alertTitles[type]),
    description: `Automated threat detection identified suspicious activity consistent with ${type.toLowerCase().replace(/_/g, ' ')} tactics. AI analysis indicates ${severity.toLowerCase()} confidence in threat classification.`,
    type,
    severity: severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    status,
    sourceIp: randomIp(),
    destinationIp: randomIp(),
    threatScore: severity === 'CRITICAL' ? Math.floor(Math.random() * 15) + 85 : severity === 'HIGH' ? Math.floor(Math.random() * 20) + 65 : severity === 'MEDIUM' ? Math.floor(Math.random() * 20) + 45 : Math.floor(Math.random() * 30) + 15,
    assignedTo: randomItem(analysts),
    assignedAnalyst: randomItem(analysts),
    resolvedAt: status === 'RESOLVED' ? new Date(ts.getTime() + 3600000).toISOString() : null,
    aiExplanation: `The AI engine detected patterns consistent with ${type.toLowerCase().replace(/_/g, ' ')} activity. Multiple indicators of compromise were identified across ${Math.floor(Math.random() * 5) + 2} related events.`,
    reasons: [
      'Pattern matches known attack signature in threat database',
      `${Math.floor(Math.random() * 50) + 10} related events in the last ${Math.floor(Math.random() * 24) + 1} hours`,
      'Source IP has been flagged in multiple threat intelligence feeds',
      'Behavioral analysis shows deviation from baseline activity',
    ],
    relatedLogIds: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => `log-${String(j + 1).padStart(4, '0')}`),
    createdAt: ts.toISOString(),
    updatedAt: ts.toISOString(),
  };
}).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

// ==================== Threat Entities (Phase 2) ====================
function generateScoreHistory(baseScore: number, trending: 'up' | 'down' | 'stable'): { date: string; score: number }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    let score: number;
    if (trending === 'up') {
      score = Math.min(100, Math.max(0, baseScore - 30 + (i * 5) + Math.floor(Math.random() * 8 - 4)));
    } else if (trending === 'down') {
      score = Math.min(100, Math.max(0, baseScore + 20 - (i * 4) + Math.floor(Math.random() * 6 - 3)));
    } else {
      score = Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 10 - 5)));
    }
    return { date: date.toISOString().split('T')[0], score };
  });
}

export const mockThreatEntities: ThreatEntity[] = [
  {
    id: 'te-001',
    entityType: 'IP',
    entityValue: '185.220.101.34',
    score: 96,
    category: 'CRITICAL',
    factors: { anomalyScore: 0.95, failedLoginFactor: 0.88, countryRisk: 0.92, portRisk: 0.78, severityFactor: 0.97 },
    modelUsed: 'IsolationForest + GBM Ensemble',
    confidence: 97,
    lastSeen: new Date(Date.now() - 180000).toISOString(),
    alertCount: 47,
    country: 'Russia',
    relatedAlerts: ['alert-0001', 'alert-0006', 'alert-0011'],
    scoreHistory: generateScoreHistory(96, 'up'),
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'te-002',
    entityType: 'IP',
    entityValue: '45.33.32.156',
    score: 92,
    category: 'CRITICAL',
    factors: { anomalyScore: 0.91, failedLoginFactor: 0.82, countryRisk: 0.88, portRisk: 0.85, severityFactor: 0.94 },
    modelUsed: 'IsolationForest + GBM Ensemble',
    confidence: 95,
    lastSeen: new Date(Date.now() - 420000).toISOString(),
    alertCount: 38,
    country: 'China',
    relatedAlerts: ['alert-0002', 'alert-0007'],
    scoreHistory: generateScoreHistory(92, 'up'),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'te-003',
    entityType: 'USER',
    entityValue: 'admin_compromised',
    score: 89,
    category: 'CRITICAL',
    factors: { anomalyScore: 0.87, failedLoginFactor: 0.93, countryRisk: 0.45, portRisk: 0.62, severityFactor: 0.91 },
    modelUsed: 'Random Forest + SHAP',
    confidence: 93,
    lastSeen: new Date(Date.now() - 600000).toISOString(),
    alertCount: 31,
    relatedAlerts: ['alert-0003', 'alert-0008', 'alert-0012'],
    scoreHistory: generateScoreHistory(89, 'up'),
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'te-004',
    entityType: 'IP',
    entityValue: '103.224.182.250',
    score: 82,
    category: 'HIGH_RISK',
    factors: { anomalyScore: 0.78, failedLoginFactor: 0.65, countryRisk: 0.88, portRisk: 0.72, severityFactor: 0.81 },
    modelUsed: 'IsolationForest',
    confidence: 88,
    lastSeen: new Date(Date.now() - 1200000).toISOString(),
    alertCount: 24,
    country: 'China',
    relatedAlerts: ['alert-0004', 'alert-0009'],
    scoreHistory: generateScoreHistory(82, 'up'),
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'te-005',
    entityType: 'IP',
    entityValue: '91.240.118.172',
    score: 78,
    category: 'HIGH_RISK',
    factors: { anomalyScore: 0.72, failedLoginFactor: 0.58, countryRisk: 0.84, portRisk: 0.68, severityFactor: 0.76 },
    modelUsed: 'GBM Classifier',
    confidence: 85,
    lastSeen: new Date(Date.now() - 1800000).toISOString(),
    alertCount: 19,
    country: 'Ukraine',
    relatedAlerts: ['alert-0005', 'alert-0010'],
    scoreHistory: generateScoreHistory(78, 'up'),
    createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
  },
  {
    id: 'te-006',
    entityType: 'USER',
    entityValue: 'jsmith_ops',
    score: 74,
    category: 'HIGH_RISK',
    factors: { anomalyScore: 0.68, failedLoginFactor: 0.79, countryRisk: 0.32, portRisk: 0.55, severityFactor: 0.71 },
    modelUsed: 'Random Forest + SHAP',
    confidence: 82,
    lastSeen: new Date(Date.now() - 2400000).toISOString(),
    alertCount: 15,
    relatedAlerts: ['alert-0013', 'alert-0014'],
    scoreHistory: generateScoreHistory(74, 'stable'),
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'te-007',
    entityType: 'IP',
    entityValue: '185.56.83.84',
    score: 67,
    category: 'HIGH_RISK',
    factors: { anomalyScore: 0.62, failedLoginFactor: 0.48, countryRisk: 0.55, portRisk: 0.71, severityFactor: 0.65 },
    modelUsed: 'IsolationForest',
    confidence: 79,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    alertCount: 12,
    country: 'Netherlands',
    relatedAlerts: ['alert-0015'],
    scoreHistory: generateScoreHistory(67, 'stable'),
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: 'te-008',
    entityType: 'IP',
    entityValue: '45.155.205.233',
    score: 58,
    category: 'MEDIUM_RISK',
    factors: { anomalyScore: 0.55, failedLoginFactor: 0.42, countryRisk: 0.38, portRisk: 0.62, severityFactor: 0.54 },
    modelUsed: 'GBM Classifier',
    confidence: 74,
    lastSeen: new Date(Date.now() - 5400000).toISOString(),
    alertCount: 8,
    country: 'Germany',
    relatedAlerts: ['alert-0016', 'alert-0017'],
    scoreHistory: generateScoreHistory(58, 'stable'),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'te-009',
    entityType: 'USER',
    entityValue: 'dbadmin_prod',
    score: 53,
    category: 'MEDIUM_RISK',
    factors: { anomalyScore: 0.51, failedLoginFactor: 0.55, countryRisk: 0.22, portRisk: 0.48, severityFactor: 0.52 },
    modelUsed: 'Random Forest + SHAP',
    confidence: 71,
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    alertCount: 6,
    relatedAlerts: ['alert-0018'],
    scoreHistory: generateScoreHistory(53, 'down'),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'te-010',
    entityType: 'IP',
    entityValue: '192.241.214.87',
    score: 48,
    category: 'MEDIUM_RISK',
    factors: { anomalyScore: 0.44, failedLoginFactor: 0.38, countryRisk: 0.25, portRisk: 0.52, severityFactor: 0.46 },
    modelUsed: 'IsolationForest',
    confidence: 68,
    lastSeen: new Date(Date.now() - 10800000).toISOString(),
    alertCount: 5,
    country: 'United States',
    relatedAlerts: ['alert-0019'],
    scoreHistory: generateScoreHistory(48, 'stable'),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'te-011',
    entityType: 'USER',
    entityValue: 'contractor_ext',
    score: 41,
    category: 'MEDIUM_RISK',
    factors: { anomalyScore: 0.38, failedLoginFactor: 0.45, countryRisk: 0.18, portRisk: 0.35, severityFactor: 0.42 },
    modelUsed: 'Random Forest + SHAP',
    confidence: 65,
    lastSeen: new Date(Date.now() - 14400000).toISOString(),
    alertCount: 4,
    relatedAlerts: ['alert-0020'],
    scoreHistory: generateScoreHistory(41, 'down'),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'te-012',
    entityType: 'IP',
    entityValue: '178.128.220.21',
    score: 32,
    category: 'LOW_RISK',
    factors: { anomalyScore: 0.28, failedLoginFactor: 0.22, countryRisk: 0.35, portRisk: 0.31, severityFactor: 0.29 },
    modelUsed: 'GBM Classifier',
    confidence: 72,
    lastSeen: new Date(Date.now() - 21600000).toISOString(),
    alertCount: 3,
    country: 'Singapore',
    relatedAlerts: ['alert-0021'],
    scoreHistory: generateScoreHistory(32, 'down'),
    createdAt: new Date(Date.now() - 86400000 * 13).toISOString(),
  },
  {
    id: 'te-013',
    entityType: 'IP',
    entityValue: '159.89.173.104',
    score: 22,
    category: 'LOW_RISK',
    factors: { anomalyScore: 0.18, failedLoginFactor: 0.15, countryRisk: 0.28, portRisk: 0.22, severityFactor: 0.19 },
    modelUsed: 'IsolationForest',
    confidence: 78,
    lastSeen: new Date(Date.now() - 43200000).toISOString(),
    alertCount: 2,
    country: 'India',
    relatedAlerts: ['alert-0022'],
    scoreHistory: generateScoreHistory(22, 'down'),
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'te-014',
    entityType: 'USER',
    entityValue: 'viewer_readonly',
    score: 12,
    category: 'SAFE',
    factors: { anomalyScore: 0.08, failedLoginFactor: 0.05, countryRisk: 0.1, portRisk: 0.12, severityFactor: 0.07 },
    modelUsed: 'Random Forest + SHAP',
    confidence: 92,
    lastSeen: new Date(Date.now() - 86400000).toISOString(),
    alertCount: 0,
    relatedAlerts: [],
    scoreHistory: generateScoreHistory(12, 'stable'),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'te-015',
    entityType: 'IP',
    entityValue: '68.183.44.143',
    score: 8,
    category: 'SAFE',
    factors: { anomalyScore: 0.05, failedLoginFactor: 0.03, countryRisk: 0.08, portRisk: 0.06, severityFactor: 0.04 },
    modelUsed: 'GBM Classifier',
    confidence: 95,
    lastSeen: new Date(Date.now() - 172800000).toISOString(),
    alertCount: 0,
    country: 'United States',
    relatedAlerts: [],
    scoreHistory: generateScoreHistory(8, 'stable'),
    createdAt: new Date(Date.now() - 86400000 * 16).toISOString(),
  },
];

export const mockThreatSummary: ThreatAnalysisSummary = {
  totalEntities: mockThreatEntities.length,
  criticalCount: mockThreatEntities.filter(e => e.category === 'CRITICAL').length,
  highRiskCount: mockThreatEntities.filter(e => e.category === 'HIGH_RISK').length,
  mediumRiskCount: mockThreatEntities.filter(e => e.category === 'MEDIUM_RISK').length,
  avgScore: Math.round(mockThreatEntities.reduce((sum, e) => sum + e.score, 0) / mockThreatEntities.length),
  topThreats: mockThreatEntities.filter(e => e.score >= 80),
};
