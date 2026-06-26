/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Comprehensive seed script for the Cyber Threat Intelligence Platform.
 *
 * Populates PostgreSQL (via Prisma) and MongoDB (via Mongoose) with:
 * - 3 users (admin, analyst, viewer)
 * - 10,000 realistic security logs
 * - 150 alerts
 * - 50 threat scores
 * - 10 blocked IPs
 * - Audit log entries
 *
 * Run: npx ts-node prisma/seed.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from ../.env
dotenv.config({ path: resolve(__dirname, '..', '.env') });

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const prisma = new PrismaClient();

// ============================================================
// Constants & Helpers
// ============================================================

const TOTAL_LOGS = 10_000;
const TOTAL_ALERTS = 150;
const TOTAL_THREAT_SCORES = 50;
const TOTAL_BLOCKED_IPS = 10;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Seeded pseudo-random for reproducibility. */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const random = seededRandom(42);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(random() * arr.length)]!;
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => random() - 0.5);
  return shuffled.slice(0, n);
}

function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const val = random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  return new Date(now - Math.floor(random() * daysBack * 24 * 60 * 60 * 1000));
}

function randomIp(): string {
  return `${randomInt(1, 254)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

// ============================================================
// Data Pools
// ============================================================

const COUNTRIES = [
  { name: 'United States', code: 'US', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'], lat: [25, 48], lon: [-125, -67] },
  { name: 'United Kingdom', code: 'UK', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'], lat: [50, 58], lon: [-8, 2] },
  { name: 'Germany', code: 'DE', cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'], lat: [47, 55], lon: [6, 15] },
  { name: 'Russia', code: 'RU', cities: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg'], lat: [41, 82], lon: [19, 180] },
  { name: 'China', code: 'CN', cities: ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou', 'Chengdu'], lat: [18, 54], lon: [73, 135] },
  { name: 'Brazil', code: 'BR', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], lat: [-33, 5], lon: [-74, -35] },
  { name: 'India', code: 'IN', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'], lat: [6, 36], lon: [68, 97] },
  { name: 'Nigeria', code: 'NG', cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan'], lat: [4, 14], lon: [3, 15] },
  { name: 'Iran', code: 'IR', cities: ['Tehran', 'Isfahan', 'Tabriz', 'Shiraz'], lat: [25, 40], lon: [44, 63] },
  { name: 'North Korea', code: 'KP', cities: ['Pyongyang', 'Hamhung', 'Chongjin'], lat: [37, 43], lon: [124, 131] },
] as const;

const MALICIOUS_COUNTRIES = ['Russia', 'China', 'Nigeria', 'Iran', 'North Korea'] as const;

const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'SSH', 'FTP', 'DNS', 'SMTP'] as const;

const SOURCES = ['FIREWALL', 'IDS', 'ANTIVIRUS', 'SERVER', 'APPLICATION', 'CLOUD', 'NETWORK'] as const;

const EVENT_TYPES = [
  'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'CONNECTION_ATTEMPT', 'PORT_SCAN',
  'FILE_ACCESS', 'MALWARE_DETECTED', 'POLICY_VIOLATION', 'DATA_EXFILTRATION',
] as const;

const DEVICE_TYPES = ['Desktop', 'Laptop', 'Mobile', 'Tablet', 'Server', 'IoT Device'] as const;

const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Brave', 'Tor Browser', 'curl'] as const;

const OS_LIST = ['Windows 11', 'Windows 10', 'macOS 14', 'Ubuntu 22.04', 'CentOS 8', 'Kali Linux', 'Android 14', 'iOS 17'] as const;

const ALERT_TYPES = [
  'BRUTE_FORCE', 'SUSPICIOUS_LOGIN', 'PORT_SCAN', 'DDOS',
  'MALWARE', 'CREDENTIAL_STUFFING', 'INSIDER_THREAT', 'UNAUTHORIZED_ACCESS',
] as const;

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const ALERT_MESSAGES: Record<string, string[]> = {
  BRUTE_FORCE: [
    'Multiple failed login attempts detected from single IP',
    'Brute force attack pattern identified on SSH service',
    'Rapid authentication failures exceeding threshold',
    'Dictionary attack detected against admin panel',
  ],
  SUSPICIOUS_LOGIN: [
    'Login from unusual geographic location',
    'Login from previously unseen device and browser',
    'Simultaneous logins from different countries',
    'Login at unusual hour from high-risk country',
  ],
  PORT_SCAN: [
    'Sequential port scanning detected from external IP',
    'SYN scan detected across multiple ports',
    'Network reconnaissance activity identified',
    'Stealth port scan targeting critical services',
  ],
  DDOS: [
    'Distributed denial-of-service attack in progress',
    'Abnormal traffic volume exceeding baseline by 500%',
    'SYN flood attack detected on web server',
    'UDP amplification attack targeting DNS infrastructure',
  ],
  MALWARE: [
    'Known malware signature detected in uploaded file',
    'Trojan communication pattern identified',
    'Ransomware encryption activity detected',
    'Suspicious executable downloaded from external source',
  ],
  CREDENTIAL_STUFFING: [
    'Credential stuffing attack using known breach data',
    'Automated login attempts with multiple username/password pairs',
    'Bot-like authentication pattern detected',
    'Mass login attempt using leaked credentials database',
  ],
  INSIDER_THREAT: [
    'Unusual data access pattern by internal user',
    'Large volume file download by privileged user after hours',
    'Access to restricted resources outside normal scope',
    'Suspicious database query pattern detected',
  ],
  UNAUTHORIZED_ACCESS: [
    'Unauthorized access attempt to admin panel',
    'Privilege escalation attempt detected',
    'Access to restricted API endpoint without authorization',
    'Bypass attempt of access control mechanisms',
  ],
};

const NORMAL_MESSAGES = [
  'Routine health check completed successfully',
  'Standard user session established',
  'Scheduled backup operation completed',
  'Regular DNS query resolution',
  'HTTP request processed normally',
  'Authentication successful via SSO',
  'Standard API call from authorized application',
  'Email delivered successfully via SMTP relay',
  'VPN tunnel established for remote user',
  'Firewall rule match: allow outbound HTTP traffic',
  'Certificate renewal completed for web service',
  'Database query completed within normal parameters',
  'CDN cache hit for static resource',
  'Load balancer health check passed',
  'Cron job executed successfully',
];

// ============================================================
// Malicious IPs pool — reused across logs
// ============================================================

const MALICIOUS_IPS: string[] = [];
for (let i = 0; i < 25; i++) {
  MALICIOUS_IPS.push(randomIp());
}

// ============================================================
// Log Generation Functions
// ============================================================

interface RawLog {
  timestamp: Date;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  action: string;
  severity: string;
  source: string;
  eventType: string;
  message: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  userId?: string;
  userName?: string;
  deviceType: string;
  browser: string;
  os: string;
  rawData: Record<string, unknown>;
  isProcessed: boolean;
  anomalyScore?: number;
  threatScore?: number;
  processedAt?: Date;
  metadata: Record<string, unknown>;
}

function generateNormalLog(timestamp: Date): RawLog {
  const countryData = pick(COUNTRIES.filter((c) => !MALICIOUS_COUNTRIES.includes(c.name as typeof MALICIOUS_COUNTRIES[number])));
  const city = pick(countryData.cities);
  const protocol = pick(PROTOCOLS);
  const destPort = protocol === 'HTTP' ? 80 : protocol === 'HTTPS' ? 443 : protocol === 'SSH' ? 22 : protocol === 'FTP' ? 21 : protocol === 'DNS' ? 53 : protocol === 'SMTP' ? 25 : randomInt(1024, 65535);

  return {
    timestamp,
    sourceIp: randomIp(),
    destinationIp: `10.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
    sourcePort: randomInt(1024, 65535),
    destinationPort: destPort,
    protocol,
    action: 'ALLOW',
    severity: random() < 0.8 ? 'LOW' : 'MEDIUM',
    source: pick(SOURCES),
    eventType: random() < 0.6 ? 'LOGIN_SUCCESS' : pick(['CONNECTION_ATTEMPT', 'FILE_ACCESS']),
    message: pick(NORMAL_MESSAGES),
    country: countryData.name,
    city,
    latitude: randomFloat(countryData.lat[0], countryData.lat[1], 4),
    longitude: randomFloat(countryData.lon[0], countryData.lon[1], 4),
    deviceType: pick(DEVICE_TYPES),
    browser: pick(BROWSERS),
    os: pick(OS_LIST),
    rawData: { type: 'normal_traffic', session_id: `sess_${randomInt(100000, 999999)}` },
    isProcessed: true,
    anomalyScore: randomFloat(0, 15),
    threatScore: randomFloat(0, 20),
    processedAt: new Date(timestamp.getTime() + randomInt(1000, 60000)),
    metadata: { processed_by: 'auto_classifier', version: '1.2.0' },
  };
}

function generateSuspiciousLog(timestamp: Date): RawLog {
  const isMaliciousCountry = random() < 0.6;
  const countryData = isMaliciousCountry
    ? pick(COUNTRIES.filter((c) => MALICIOUS_COUNTRIES.includes(c.name as typeof MALICIOUS_COUNTRIES[number])))
    : pick(COUNTRIES);
  const city = pick(countryData.cities);

  const eventType = pick(['LOGIN_FAILURE', 'CONNECTION_ATTEMPT', 'PORT_SCAN', 'POLICY_VIOLATION']);
  const severity = random() < 0.4 ? 'MEDIUM' : 'HIGH';

  let message: string;
  let action: string;

  switch (eventType) {
    case 'LOGIN_FAILURE':
      message = `Failed login attempt from ${countryData.name} — invalid credentials`;
      action = 'DENY';
      break;
    case 'PORT_SCAN':
      message = `Port scanning activity detected — probed ${randomInt(5, 50)} ports`;
      action = 'ALERT';
      break;
    case 'POLICY_VIOLATION':
      message = `Security policy violation: unauthorized access to restricted resource`;
      action = 'DENY';
      break;
    default:
      message = `Suspicious connection attempt from ${countryData.name}`;
      action = 'ALERT';
  }

  return {
    timestamp,
    sourceIp: random() < 0.5 ? pick(MALICIOUS_IPS) : randomIp(),
    destinationIp: `10.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
    sourcePort: randomInt(1024, 65535),
    destinationPort: randomInt(1, 65535),
    protocol: pick(PROTOCOLS),
    action,
    severity,
    source: pick(SOURCES),
    eventType,
    message,
    country: countryData.name,
    city,
    latitude: randomFloat(countryData.lat[0], countryData.lat[1], 4),
    longitude: randomFloat(countryData.lon[0], countryData.lon[1], 4),
    userName: random() < 0.3 ? `user_${randomInt(1, 500)}` : undefined,
    deviceType: pick(DEVICE_TYPES),
    browser: pick(BROWSERS),
    os: pick(OS_LIST),
    rawData: { type: 'suspicious_activity', risk_level: severity },
    isProcessed: true,
    anomalyScore: randomFloat(40, 75),
    threatScore: randomFloat(35, 70),
    processedAt: new Date(timestamp.getTime() + randomInt(1000, 30000)),
    metadata: { processed_by: 'threat_analyzer', flagged: true },
  };
}

function generateMaliciousLog(timestamp: Date): RawLog {
  const countryData = pick(COUNTRIES.filter((c) => MALICIOUS_COUNTRIES.includes(c.name as typeof MALICIOUS_COUNTRIES[number])));
  const city = pick(countryData.cities);

  const eventType = pick(['LOGIN_FAILURE', 'PORT_SCAN', 'MALWARE_DETECTED', 'DATA_EXFILTRATION']);
  const severity = random() < 0.5 ? 'HIGH' : 'CRITICAL';

  const sourceIp = pick(MALICIOUS_IPS);

  let message: string;
  switch (eventType) {
    case 'MALWARE_DETECTED':
      message = `Malware signature match: ${pick(['Emotet', 'TrickBot', 'Cobalt Strike', 'Mimikatz', 'WannaCry', 'NotPetya'])} variant detected`;
      break;
    case 'DATA_EXFILTRATION':
      message = `Data exfiltration attempt — ${randomInt(100, 5000)}MB transferred to external IP`;
      break;
    case 'PORT_SCAN':
      message = `Aggressive port scan — ${randomInt(100, 1000)} ports probed in ${randomInt(5, 30)} seconds`;
      break;
    default:
      message = `Brute force attack: ${randomInt(50, 500)} failed attempts in ${randomInt(1, 10)} minutes`;
  }

  return {
    timestamp,
    sourceIp,
    destinationIp: `10.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
    sourcePort: randomInt(1024, 65535),
    destinationPort: randomInt(1, 65535),
    protocol: pick(PROTOCOLS),
    action: pick(['DENY', 'DROP', 'ALERT']),
    severity,
    source: pick(SOURCES),
    eventType,
    message,
    country: countryData.name,
    city,
    latitude: randomFloat(countryData.lat[0], countryData.lat[1], 4),
    longitude: randomFloat(countryData.lon[0], countryData.lon[1], 4),
    userName: random() < 0.2 ? `compromised_${randomInt(1, 100)}` : undefined,
    deviceType: pick(DEVICE_TYPES),
    browser: pick(BROWSERS),
    os: pick(OS_LIST),
    rawData: { type: 'malicious_activity', attack_vector: eventType, ioc: sourceIp },
    isProcessed: true,
    anomalyScore: randomFloat(75, 100),
    threatScore: randomFloat(70, 100),
    processedAt: new Date(timestamp.getTime() + randomInt(500, 10000)),
    metadata: { processed_by: 'threat_analyzer', flagged: true, escalated: true },
  };
}

// ============================================================
// Main Seed Function
// ============================================================

async function main() {
  console.log('🌱 Starting seed process…\n');

  // ─── Connect to MongoDB ────────────────────────────────────────
  const mongoUri = process.env['MONGODB_URI'];
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  console.log('📦 Connecting to MongoDB…');
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected\n');

  // ─── Define MongoDB schema (standalone, no NestJS) ─────────────
  const securityLogSchema = new mongoose.Schema(
    {
      timestamp: { type: Date, required: true, index: true },
      sourceIp: { type: String, required: true, index: true },
      destinationIp: { type: String, required: true },
      sourcePort: { type: Number, required: true },
      destinationPort: { type: Number, required: true },
      protocol: { type: String, required: true },
      action: { type: String, required: true },
      severity: { type: String, required: true, index: true },
      source: { type: String, required: true },
      eventType: { type: String, required: true },
      message: { type: String, required: true },
      country: String,
      city: String,
      latitude: Number,
      longitude: Number,
      userId: String,
      userName: String,
      deviceType: String,
      browser: String,
      os: String,
      rawData: mongoose.Schema.Types.Mixed,
      isProcessed: { type: Boolean, default: false, index: true },
      anomalyScore: Number,
      threatScore: Number,
      processedAt: Date,
      metadata: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true, collection: 'security_logs' },
  );

  const SecurityLogModel =
    mongoose.models['SecurityLog'] ||
    mongoose.model('SecurityLog', securityLogSchema);

  // ─── Clean existing data ───────────────────────────────────────
  console.log('🧹 Cleaning existing data…');
  await Promise.all([
    prisma.auditLog.deleteMany(),
    prisma.blockedIP.deleteMany(),
    prisma.threatScore.deleteMany(),
    prisma.alert.deleteMany(),
    prisma.report.deleteMany(),
    prisma.notificationSetting.deleteMany(),
  ]);
  await prisma.user.deleteMany();
  await SecurityLogModel.deleteMany({});
  console.log('✅ Existing data cleaned\n');

  // ─── 1. Create Users ──────────────────────────────────────────
  console.log('👤 Creating users…');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@cti.com',
        password: await bcrypt.hash('Admin@123', 12),
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        lastLoginAt: new Date(),
        lastLoginIp: '192.168.1.1',
      },
    }),
    prisma.user.create({
      data: {
        email: 'analyst@cti.com',
        password: await bcrypt.hash('Analyst@123', 12),
        firstName: 'Security',
        lastName: 'Analyst',
        role: 'ANALYST',
        isActive: true,
        isVerified: true,
        lastLoginAt: new Date(),
        lastLoginIp: '192.168.1.2',
      },
    }),
    prisma.user.create({
      data: {
        email: 'viewer@cti.com',
        password: await bcrypt.hash('Viewer@123', 12),
        firstName: 'Dashboard',
        lastName: 'Viewer',
        role: 'VIEWER',
        isActive: true,
        isVerified: true,
        lastLoginAt: new Date(),
        lastLoginIp: '192.168.1.3',
      },
    }),
  ]);
  const [adminUser, analystUser] = users;
  console.log(`✅ Created ${users.length} users\n`);

  // ─── 2. Generate 10,000 Security Logs ─────────────────────────
  console.log(`📝 Generating ${TOTAL_LOGS.toLocaleString()} security logs…`);

  const allLogs: RawLog[] = [];
  const maliciousLogs: RawLog[] = [];
  const suspiciousLogs: RawLog[] = [];

  for (let i = 0; i < TOTAL_LOGS; i++) {
    const timestamp = randomDate(30);
    const r = random();

    let log: RawLog;
    if (r < 0.70) {
      // 70% normal traffic
      log = generateNormalLog(timestamp);
    } else if (r < 0.90) {
      // 20% suspicious
      log = generateSuspiciousLog(timestamp);
      suspiciousLogs.push(log);
    } else {
      // 10% malicious
      log = generateMaliciousLog(timestamp);
      maliciousLogs.push(log);
    }

    allLogs.push(log);
  }

  // Insert logs in batches of 1000
  const BATCH_SIZE = 1000;
  for (let i = 0; i < allLogs.length; i += BATCH_SIZE) {
    const batch = allLogs.slice(i, i + BATCH_SIZE);
    await SecurityLogModel.insertMany(batch);
    process.stdout.write(`\r  Inserted ${Math.min(i + BATCH_SIZE, allLogs.length).toLocaleString()} / ${TOTAL_LOGS.toLocaleString()} logs`);
  }
  console.log(`\n✅ Inserted ${TOTAL_LOGS.toLocaleString()} security logs\n`);

  // ─── 3. Create 150 Alerts ─────────────────────────────────────
  console.log(`🚨 Creating ${TOTAL_ALERTS} alerts…`);

  const alertData: Array<{
    type: string;
    severity: string;
    status: string;
    title: string;
    description: string;
    sourceIp: string;
    threatScore: number;
    reasons: unknown;
    assignedToId: string | null;
    resolvedAt: Date | null;
    createdAt: Date;
  }> = [];

  // Create alerts from malicious and suspicious logs
  const alertSourceLogs = [...maliciousLogs, ...suspiciousLogs].slice(0, TOTAL_ALERTS);

  for (let i = 0; i < TOTAL_ALERTS; i++) {
    const sourcelog = alertSourceLogs[i % alertSourceLogs.length]!;
    const alertType = pick(ALERT_TYPES);
    const severity = i < 20 ? 'CRITICAL' : i < 60 ? 'HIGH' : i < 110 ? 'MEDIUM' : 'LOW';
    const statusRoll = random();
    const status =
      statusRoll < 0.35 ? 'NEW' :
      statusRoll < 0.60 ? 'INVESTIGATING' :
      statusRoll < 0.85 ? 'RESOLVED' :
      'FALSE_POSITIVE';

    const messages = ALERT_MESSAGES[alertType]!;
    const title = messages[i % messages.length]!;

    alertData.push({
      type: alertType,
      severity,
      status,
      title,
      description: `${title}. Source IP: ${sourcelog.sourceIp}, Country: ${sourcelog.country}. Event detected by ${sourcelog.source} at ${sourcelog.timestamp.toISOString()}.`,
      sourceIp: sourcelog.sourceIp,
      threatScore: sourcelog.threatScore || randomFloat(40, 100),
      reasons: [
        `Detected from ${sourcelog.country}`,
        `Event type: ${sourcelog.eventType}`,
        `Severity: ${severity}`,
        `Source: ${sourcelog.source}`,
        ...(sourcelog.anomalyScore && sourcelog.anomalyScore > 60 ? ['High anomaly score'] : []),
      ],
      assignedToId: random() < 0.6 ? (random() < 0.5 ? adminUser!.id : analystUser!.id) : null,
      resolvedAt: status === 'RESOLVED' || status === 'FALSE_POSITIVE' ? randomDate(15) : null,
      createdAt: sourcelog.timestamp,
    });
  }

  for (const alert of alertData) {
    await prisma.alert.create({ data: alert as Parameters<typeof prisma.alert.create>[0]['data'] });
  }
  console.log(`✅ Created ${TOTAL_ALERTS} alerts\n`);

  // ─── 4. Create 50 Threat Scores ───────────────────────────────
  console.log(`📊 Creating ${TOTAL_THREAT_SCORES} threat scores…`);

  const scoredIps = pickN(MALICIOUS_IPS, 30);
  const threatScoreData: Array<{
    entityType: string;
    entityValue: string;
    score: number;
    category: string;
    factors: unknown;
    modelUsed: string;
    confidence: number;
    createdAt: Date;
  }> = [];

  for (let i = 0; i < TOTAL_THREAT_SCORES; i++) {
    const isIp = i < 30;
    const entityType = isIp ? 'IP' : i < 40 ? 'USER' : 'SESSION';
    const entityValue = isIp
      ? scoredIps[i % scoredIps.length]!
      : entityType === 'USER'
        ? `user_${randomInt(1, 500)}`
        : `sess_${randomInt(100000, 999999)}`;

    const score = randomFloat(0, 100);
    const category =
      score < 20 ? 'SAFE' :
      score < 40 ? 'LOW_RISK' :
      score < 60 ? 'MEDIUM_RISK' :
      score < 80 ? 'HIGH_RISK' :
      'CRITICAL';

    threatScoreData.push({
      entityType,
      entityValue,
      score,
      category,
      factors: [
        { factor: 'geo_risk', weight: randomFloat(0, 1), value: randomFloat(0, 100) },
        { factor: 'behavior_analysis', weight: randomFloat(0, 1), value: randomFloat(0, 100) },
        { factor: 'reputation_score', weight: randomFloat(0, 1), value: randomFloat(0, 100) },
        { factor: 'historical_incidents', weight: randomFloat(0, 1), value: randomInt(0, 50) },
      ],
      modelUsed: pick(['random_forest_v2', 'gradient_boost_v3', 'neural_net_v1', 'ensemble_v4']),
      confidence: randomFloat(0.6, 0.99),
      createdAt: randomDate(30),
    });
  }

  for (const ts of threatScoreData) {
    await prisma.threatScore.create({ data: ts as Parameters<typeof prisma.threatScore.create>[0]['data'] });
  }
  console.log(`✅ Created ${TOTAL_THREAT_SCORES} threat scores\n`);

  // ─── 5. Create 10 Blocked IPs ─────────────────────────────────
  console.log(`🔒 Creating ${TOTAL_BLOCKED_IPS} blocked IPs…`);

  const ipsToBlock = pickN(MALICIOUS_IPS, TOTAL_BLOCKED_IPS);
  for (let i = 0; i < ipsToBlock.length; i++) {
    const ip = ipsToBlock[i]!;
    await prisma.blockedIP.create({
      data: {
        ipAddress: ip,
        reason: pick([
          'Repeated brute force attacks',
          'Port scanning activity',
          'Malware command and control communication',
          'DDoS attack source',
          'Data exfiltration attempt',
          'Known malicious IP from threat intelligence feed',
          'Credential stuffing source',
          'Automated vulnerability scanning',
        ]),
        blockedById: random() < 0.5 ? adminUser!.id : analystUser!.id,
        expiresAt: random() < 0.3 ? new Date(Date.now() + randomInt(1, 90) * 24 * 60 * 60 * 1000) : null,
        isActive: true,
        createdAt: randomDate(20),
      },
    });
  }
  console.log(`✅ Created ${TOTAL_BLOCKED_IPS} blocked IPs\n`);

  // ─── 6. Create Audit Logs ─────────────────────────────────────
  console.log('📋 Creating audit log entries…');

  const auditActions = [
    { action: 'USER_LOGIN', entityType: 'User' },
    { action: 'USER_CREATED', entityType: 'User' },
    { action: 'ALERT_UPDATED', entityType: 'Alert' },
    { action: 'ALERT_ASSIGNED', entityType: 'Alert' },
    { action: 'ALERT_RESOLVED', entityType: 'Alert' },
    { action: 'IP_BLOCKED', entityType: 'BlockedIP' },
    { action: 'IP_UNBLOCKED', entityType: 'BlockedIP' },
    { action: 'REPORT_GENERATED', entityType: 'Report' },
    { action: 'SETTINGS_UPDATED', entityType: 'NotificationSetting' },
    { action: 'USER_ROLE_CHANGED', entityType: 'User' },
  ];

  const auditEntries = [];
  for (let i = 0; i < 50; i++) {
    const auditAction = pick(auditActions);
    const user = pick(users);
    auditEntries.push({
      userId: user!.id,
      action: auditAction.action,
      entityType: auditAction.entityType,
      entityId: `entity_${randomInt(1, 1000)}`,
      details: {
        description: `${auditAction.action} performed by ${user!.email}`,
        ip: randomIp(),
        userAgent: `${pick(BROWSERS)} on ${pick(OS_LIST)}`,
      },
      ipAddress: randomIp(),
      createdAt: randomDate(30),
    });
  }

  for (const entry of auditEntries) {
    await prisma.auditLog.create({ data: entry });
  }
  console.log(`✅ Created ${auditEntries.length} audit log entries\n`);

  // ─── 7. Create Notification Settings ──────────────────────────
  console.log('🔔 Creating notification settings…');
  for (const user of users) {
    await prisma.notificationSetting.create({
      data: {
        userId: user!.id,
        emailAlerts: true,
        dashboardAlerts: true,
        severityThreshold: user!.role === 'ADMIN' ? 'LOW' : user!.role === 'ANALYST' ? 'MEDIUM' : 'HIGH',
      },
    });
  }
  console.log('✅ Created notification settings\n');

  // ─── Summary ───────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════');
  console.log('  🎉 Seed completed successfully!');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  👤 Users:          ${users.length}`);
  console.log(`  📝 Security Logs:  ${TOTAL_LOGS.toLocaleString()}`);
  console.log(`    ├── Normal:      ${allLogs.length - suspiciousLogs.length - maliciousLogs.length}`);
  console.log(`    ├── Suspicious:  ${suspiciousLogs.length}`);
  console.log(`    └── Malicious:   ${maliciousLogs.length}`);
  console.log(`  🚨 Alerts:         ${TOTAL_ALERTS}`);
  console.log(`  📊 Threat Scores:  ${TOTAL_THREAT_SCORES}`);
  console.log(`  🔒 Blocked IPs:    ${TOTAL_BLOCKED_IPS}`);
  console.log(`  📋 Audit Logs:     ${auditEntries.length}`);
  console.log(`  🔔 Notification:   ${users.length}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('\n  Test credentials:');
  console.log('  Admin:   admin@cti.com   / Admin@123');
  console.log('  Analyst: analyst@cti.com / Analyst@123');
  console.log('  Viewer:  viewer@cti.com  / Viewer@123\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n❌ Seed failed:', error);
    await prisma.$disconnect();
    await mongoose.disconnect();
    process.exit(1);
  });
