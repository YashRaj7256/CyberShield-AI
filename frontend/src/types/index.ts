// ==================== User Types ====================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  isActive: boolean;
  isVerified?: boolean;
  lastLoginAt: string | null;
  lastLoginIp?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ==================== Security Log Types ====================
export type LogSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type LogAction = 'ALLOW' | 'DENY' | 'DROP' | 'ALERT';
export type LogSource = 'FIREWALL' | 'IDS' | 'ANTIVIRUS' | 'SERVER' | 'APPLICATION' | 'CLOUD' | 'NETWORK' | 'MANUAL' | 'WINDOWS_SECURITY';
export type LogProtocol = 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS' | 'SSH' | 'FTP' | 'SMTP' | 'OTHER';

export interface SecurityLog {
  id?: string;
  _id?: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: LogProtocol;
  action: LogAction;
  severity: LogSeverity;
  source: LogSource;
  eventType: string;
  message: string;
  country: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  userId: string | null;
  userName: string | null;
  rawData?: Record<string, unknown>;
  threatScore: number | null;
  anomalyScore?: number | null;
  isThreat?: boolean;
  deviceType?: string;
  browser?: string;
  os?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

// ==================== Alert Types ====================
export type AlertStatus = 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
export type AlertType = 'BRUTE_FORCE' | 'SUSPICIOUS_LOGIN' | 'PORT_SCAN' | 'DDOS' | 'MALWARE' | 'CREDENTIAL_STUFFING' | 'INSIDER_THREAT' | 'UNAUTHORIZED_ACCESS';

export interface AlertUserSummary {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: AlertType;
  severity: LogSeverity;
  status: AlertStatus;
  sourceIp: string;
  destinationIp?: string;
  threatScore: number;
  assignedToId?: string | null;
  assignedTo?: AlertUserSummary | string | null;
  assignedAnalyst?: string | null;
  resolvedAt?: string | null;
  aiExplanation?: string | null;
  reasons?: string[] | unknown;
  relatedLogIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

// ==================== Threat Score Types ====================
export interface ThreatScore {
  id: string;
  ipAddress: string;
  score: number;
  category: string;
  factors: Record<string, unknown>;
  lastUpdated: string;
}

// ==================== Dashboard Types ====================
export interface DashboardStats {
  totalLogs: number;
  totalAlerts: number;
  criticalAlerts: number;
  highRiskUsers: number;
  blockedIps: number;
  avgThreatScore: number;
}

export interface ThreatTrendPoint {
  date: string;
  threats: number;
  blocked: number;
  allowed: number;
}

export interface SeverityDistribution {
  name: string;
  value: number;
  color: string;
}

export interface AttackFrequency {
  date: string;
  bruteForce: number;
  malware: number;
  phishing: number;
  ddos: number;
  other: number;
}

export interface TopSource {
  ip: string;
  country: string;
  count: number;
  threatLevel: LogSeverity;
}

export interface RecentActivity {
  id: string;
  timestamp: string;
  type: string;
  severity: LogSeverity;
  message: string;
  sourceIp: string;
}

// ==================== API Response Types ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== Filter Types ====================
export interface LogFilters {
  search?: string;
  severity?: LogSeverity[];
  source?: LogSource[];
  action?: LogAction[];
  startDate?: string;
  endDate?: string;
  sourceIp?: string;
  country?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AlertFilters {
  severity?: LogSeverity;
  status?: AlertStatus;
  type?: AlertType;
  page?: number;
  limit?: number;
}

// ==================== Threat Entity Types (Phase 2) ====================
export type ThreatCategory = 'SAFE' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL';
export type EntityType = 'IP' | 'USER' | 'SESSION';

export interface ThreatEntity {
  id: string;
  entityType: EntityType;
  entityValue: string;
  score: number;
  category: ThreatCategory;
  factors: {
    anomalyScore: number;
    failedLoginFactor: number;
    countryRisk: number;
    portRisk: number;
    severityFactor: number;
  };
  modelUsed: string;
  confidence: number;
  lastSeen: string;
  alertCount: number;
  country?: string;
  relatedAlerts: string[];
  scoreHistory: { date: string; score: number }[];
  createdAt: string;
}

export interface ThreatAnalysisSummary {
  totalEntities: number;
  criticalCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount?: number;
  safeCount?: number;
  avgScore: number;
  topThreats: ThreatEntity[];
}

// ==================== Geo Attack Map Types (Phase 3) ====================

export interface GeoAttackOrigin {
  sourceIp: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  eventType: string;
  severity: LogSeverity;
  threatScore: number;
  timestamp: string;
  count: number;
}

export interface GeoCountryStats {
  country: string;
  attackCount: number;
  avgThreatScore: number;
  latitude: number;
  longitude: number;
}

export interface GeoAttackData {
  attackOrigins: GeoAttackOrigin[];
  topCountries: GeoCountryStats[];
  summary: {
    totalOrigins: number;
    topMaliciousCountry: string;
    criticalRegionalThreats: number;
    mostTargetedPort: number;
  };
}

// ==================== Attack Prediction Types ====================

export interface PredictionScenario {
  attack_type: string;
  probability: number;
  confidence: number;
  timeframe: string;
  description: string;
  affected_assets: string[];
  countermeasures: string[];
  indicators: string[];
  severity: LogSeverity;
}

export interface PredictionResponse {
  predictions: PredictionScenario[];
  analysis_window_hours: number;
  total_logs_analyzed: number;
  processing_time_ms: number;
  telemetry_source?: 'REAL_TELEMETRY' | 'DEMO_DATA';
}

export interface PredictRequestParams {
  windowHours?: number;
  useDatabaseLogs?: boolean;
  logs?: Record<string, unknown>[];
}

// ==================== Reports Types (Phase 3) ====================

export type ReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'INCIDENT';
export type ReportFormat = 'PDF' | 'CSV' | 'EXCEL';
export type ReportStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface ReportItem {
  id: string;
  title: string;
  type: ReportType;
  format: ReportFormat;
  dateRangeStart: string;
  dateRangeEnd: string;
  filePath?: string | null;
  status: ReportStatus;
  createdAt: string;
  generatedById: string;
  generatedBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  } | null;
  summary?: ReportSummaryData | null;
}

export interface ReportSummaryData {
  reportId: string;
  title: string;
  type: string;
  format: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  generatedAt: string;
  generatedBy: {
    id: string;
    name: string;
    email: string;
  };
  metrics: {
    totalLogs: number;
    anomalousLogs: number;
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    mediumAlerts: number;
    lowAlerts: number;
    resolvedAlerts: number;
    activeAlerts: number;
    blockedIpsCount: number;
    averageThreatScore: number;
    riskPosture: 'CRITICAL' | 'ELEVATED' | 'MODERATE' | 'NORMAL';
  };
  severityBreakdown: { severity: string; count: number; percentage: number }[];
  statusBreakdown: { status: string; count: number }[];
  topThreatTypes: { type: string; count: number }[];
  topOffendingIps: { ip: string; count: number; country?: string; avgScore?: number }[];
  topTargetPorts: { port: number; count: number }[];
  recentAlerts: {
    id: string;
    title: string;
    type: string;
    severity: string;
    sourceIp: string;
    threatScore: number;
    createdAt: string;
  }[];
  recommendations: {
    id: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    action: string;
    description: string;
  }[];
}

export interface ReportsStats {
  totalReports: number;
  pdfReports: number;
  csvReports: number;
  lastGeneratedAt: string | null;
  lastReportTitle: string | null;
}



// ==================== Settings Types (Phase 4) ====================

export interface NotificationSettings {
  id: string;
  userId: string;
  emailAlerts: boolean;
  dashboardAlerts: boolean;
  severityThreshold: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettings {
  key: string;
  value: unknown;
  category: string;
  updatedAt: string;
}

export interface SystemInfo {
  version: string;
  environment: string;
  uptime: number;
  stats: {
    totalUsers: number;
    totalAlerts: number;
    totalThreatScores: number;
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
