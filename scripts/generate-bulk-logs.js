const fs = require('fs');
const path = require('path');

const CITIES = [
  { country: 'United States', city: 'New York', lat: 40.7128, lng: -74.006 },
  { country: 'United States', city: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { country: 'United States', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { country: 'United States', city: 'Seattle', lat: 47.6062, lng: -122.3321 },
  { country: 'United States', city: 'Austin', lat: 30.2672, lng: -97.7431 },
  { country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
  { country: 'United Kingdom', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
  { country: 'Germany', city: 'Berlin', lat: 52.52, lng: 13.405 },
  { country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  { country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { country: 'China', city: 'Beijing', lat: 39.9042, lng: 116.4074 },
  { country: 'China', city: 'Shanghai', lat: 31.2304, lng: 121.4737 },
  { country: 'China', city: 'Shenzhen', lat: 22.5431, lng: 114.0579 },
  { country: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173 },
  { country: 'Russia', city: 'Saint Petersburg', lat: 59.9343, lng: 30.3351 },
  { country: 'Ukraine', city: 'Kyiv', lat: 50.4501, lng: 30.5234 },
  { country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { country: 'India', city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { country: 'India', city: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { country: 'India', city: 'New Delhi', lat: 28.6139, lng: 77.209 },
  { country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { country: 'Brazil', city: 'Sao Paulo', lat: -23.5505, lng: -46.6333 },
  { country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
  { country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { country: 'Canada', city: 'Toronto', lat: 43.6532, lng: -79.3832 },
  { country: 'Israel', city: 'Tel Aviv', lat: 32.0853, lng: 34.7818 },
  { country: 'Nigeria', city: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { country: 'Iran', city: 'Tehran', lat: 35.6892, lng: 51.389 }
];

const KNOWN_ATTACKER_IPS = [
  '185.220.101.34', '45.33.32.156', '103.224.182.250', '91.240.118.172',
  '185.56.83.84', '45.155.205.233', '194.26.29.112', '198.51.100.45',
  '203.0.113.199', '1.134.188.67', '135.65.27.208', '162.97.63.129',
  '48.82.26.206', '112.191.45.286', '96.58.249.131', '14.161.45.18',
  '178.128.220.21', '89.248.165.74', '193.142.146.35', '195.123.245.92'
];

const INTERNAL_IPS = [
  '10.0.1.15', '10.0.2.44', '10.0.3.102', '10.0.4.88', '10.0.5.210',
  '10.0.8.99', '10.0.12.45', '10.0.15.77', '172.16.0.12', '172.16.4.55',
  '192.168.1.100', '192.168.1.150', '192.168.10.25'
];

const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'SSH', 'ICMP'];
const SOURCES = ['FIREWALL', 'IDS', 'ANTIVIRUS', 'SERVER', 'APPLICATION', 'CLOUD', 'NETWORK', 'WINDOWS_SECURITY'];
const DEVICES = ['Desktop', 'Server', 'Mobile', 'Firewall Appliance', 'Cloud Instance', 'Gateway Router'];
const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'curl/8.4.0', 'python-requests/2.31.0', 'Go-http-client/2.0'];
const OS_LIST = ['Windows 11', 'Windows Server 2022', 'Ubuntu 22.04 LTS', 'macOS Sonoma', 'Debian 12', 'Alpine Linux', 'CentOS Stream 9'];
const USERS = ['admin', 'sysadmin', 'jdoe', 'asmith', 'analyst_01', 'sec_eng_04', 'svc_backup', 'svc_deploy', 'db_sync'];

const SCENARIOS = [
  {
    eventType: 'BRUTE_FORCE',
    severity: 'CRITICAL',
    action: 'DROP',
    protocol: 'SSH',
    destPort: 22,
    source: 'IDS',
    messages: [
      'SSH brute force flood detected: 320 failed auth attempts within 45 seconds',
      'Distributed SSH credential stuffing assault targeted at bastion host',
      'Automated dictionary attack executing rapid credential cycling on port 22'
    ],
    threatScoreMin: 85,
    threatScoreMax: 99
  },
  {
    eventType: 'PORT_SCAN',
    severity: 'HIGH',
    action: 'ALERT',
    protocol: 'TCP',
    destPort: 445,
    source: 'FIREWALL',
    messages: [
      'Syn stealth port scanning probe detected across 150 consecutive ports',
      'Rapid network sweep reconnaissance mapping perimeter assets and open listeners',
      'Nmap signature detected probing vulnerable SMB and RPC ports'
    ],
    threatScoreMin: 65,
    threatScoreMax: 82
  },
  {
    eventType: 'DDOS',
    severity: 'CRITICAL',
    action: 'DROP',
    protocol: 'UDP',
    destPort: 53,
    source: 'NETWORK',
    messages: [
      'Volumetric DNS amplification flood exceeding baseline ingress capacity by 450%',
      'NTP reflection attack saturating ingress edge routers at 3.8 Gbps',
      'SYN flood assault triggered rate-limiting mitigation filters'
    ],
    threatScoreMin: 88,
    threatScoreMax: 100
  },
  {
    eventType: 'MALWARE',
    severity: 'CRITICAL',
    action: 'DENY',
    protocol: 'HTTPS',
    destPort: 8443,
    source: 'ANTIVIRUS',
    messages: [
      'Cobalt Strike beaconing handshake intercepted targeting known command & control IP',
      'Mimikatz memory dump injection attempt prevented by endpoint behavioral agent',
      'Obfuscated PowerShell payload execution blocked via Antimalware Scan Interface'
    ],
    threatScoreMin: 90,
    threatScoreMax: 98
  },
  {
    eventType: 'UNAUTHORIZED_ACCESS',
    severity: 'HIGH',
    action: 'DENY',
    protocol: 'HTTPS',
    destPort: 443,
    source: 'APPLICATION',
    messages: [
      'Access attempt to restricted internal API endpoint /api/v1/enclave/keys without bearer token',
      'Privilege escalation sequence detected attempting sudoers modification via web shell',
      'Direct object reference violation attempting to retrieve tenant root cryptographic keys'
    ],
    threatScoreMin: 75,
    threatScoreMax: 90
  },
  {
    eventType: 'INSIDER_THREAT',
    severity: 'HIGH',
    action: 'ALERT',
    protocol: 'HTTPS',
    destPort: 443,
    source: 'SERVER',
    messages: [
      'Anomalous after-hours bulk query exporting 14,000 sensitive database records',
      'Unusual outbound SFTP upload initiating from financial analytics cluster to offshore IP',
      'Multiple privilege escalation invocations recorded from developer workstation WS-849'
    ],
    threatScoreMin: 70,
    threatScoreMax: 88
  },
  {
    eventType: 'SUSPICIOUS_LOGIN',
    severity: 'MEDIUM',
    action: 'ALERT',
    protocol: 'HTTPS',
    destPort: 443,
    source: 'CLOUD',
    messages: [
      'Concurrent impossible travel login recorded from both Frankfurt and Singapore within 12 minutes',
      'Administrative account access initiated from unexpected Tor exit node address',
      'MFA bypass trigger logged on corporate single sign-on federation gateway'
    ],
    threatScoreMin: 50,
    threatScoreMax: 70
  },
  {
    eventType: 'CONNECTION_ATTEMPT',
    severity: 'LOW',
    action: 'ALLOW',
    protocol: 'HTTPS',
    destPort: 443,
    source: 'FIREWALL',
    messages: [
      'Standard authorized inbound HTTPS session established to application ingress gateway',
      'Health check monitor probe successfully completed across reverse proxy cluster',
      'Automated telemetry heartbeat transmitted to regional orchestration node'
    ],
    threatScoreMin: 5,
    threatScoreMax: 25
  },
  {
    eventType: 'DNS_QUERY',
    severity: 'LOW',
    action: 'ALLOW',
    protocol: 'DNS',
    destPort: 53,
    source: 'NETWORK',
    messages: [
      'Routine forward DNS query resolved for corporate mail relay mx.cybershield.corp',
      'Internal service mesh discovery query completed for telemetry-collector.service.local',
      'Recursive reverse PTR lookup resolved cleanly for corporate VPN gateway pool'
    ],
    threatScoreMin: 2,
    threatScoreMax: 18
  },
  {
    eventType: 'POLICY_VIOLATION',
    severity: 'MEDIUM',
    action: 'DENY',
    protocol: 'TCP',
    destPort: 3389,
    source: 'WINDOWS_SECURITY',
    messages: [
      'Direct remote desktop protocol (RDP) connection blocked by zero-trust perimeter rule',
      'Plaintext HTTP transmission forbidden over external-facing production subnet',
      'Unauthorized USB mass storage connection logged on sensitive vault terminal'
    ],
    threatScoreMin: 45,
    threatScoreMax: 65
  }
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, dec = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec));
}

function generateRandomIp() {
  return `${randInt(11, 218)}.${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}`;
}

function generateLogs(count = 500) {
  const logs = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const scenario = pick(SCENARIOS);
    const loc = pick(CITIES);
    
    // Distribute timestamps over the past 7 days with recent bias
    const offsetMs = Math.floor(Math.pow(Math.random(), 1.7) * (7 * 24 * 3600 * 1000));
    const timestamp = new Date(now - offsetMs).toISOString();

    const isAttacker = scenario.severity === 'CRITICAL' || scenario.severity === 'HIGH';
    const sourceIp = isAttacker
      ? (Math.random() < 0.6 ? pick(KNOWN_ATTACKER_IPS) : generateRandomIp())
      : (Math.random() < 0.4 ? pick(INTERNAL_IPS) : generateRandomIp());

    const destinationIp = pick(INTERNAL_IPS);
    const sourcePort = randInt(1024, 65535);
    const destinationPort = scenario.destPort || pick([80, 443, 22, 53, 3306, 8080]);
    const threatScore = randFloat(scenario.threatScoreMin, scenario.threatScoreMax);
    const isThreat = scenario.severity === 'CRITICAL' || scenario.severity === 'HIGH';
    const protocol = scenario.protocol || pick(PROTOCOLS);
    const action = scenario.action;
    const severity = scenario.severity;
    const source = scenario.source || pick(SOURCES);
    const eventType = scenario.eventType;
    const message = pick(scenario.messages);

    const logEntry = {
      id: `log-${String(i + 1).padStart(4, '0')}`,
      timestamp,
      sourceIp,
      destinationIp,
      sourcePort,
      destinationPort,
      protocol,
      action,
      severity,
      source,
      eventType,
      message,
      country: loc.country,
      city: loc.city,
      latitude: loc.lat,
      longitude: loc.lng,
      userId: Math.random() < 0.45 ? `usr_${randInt(1000, 9999)}` : null,
      userName: Math.random() < 0.45 ? pick(USERS) : null,
      deviceType: pick(DEVICES),
      browser: pick(BROWSERS),
      os: pick(OS_LIST),
      rawData: {
        raw_event_id: `evt-${randInt(100000, 999999)}`,
        packet_bytes: randInt(64, 65535),
        threat_level: severity,
        triage_status: isThreat ? 'ACTION_REQUIRED' : 'NORMAL'
      },
      isProcessed: true,
      anomalyScore: randFloat(threatScore * 0.7, threatScore * 1.05),
      threatScore,
      isThreat,
      createdAt: timestamp,
      metadata: {
        ingestion_engine: 'CyberShield-Bulk-Ingest-v2.4',
        datacenter: pick(['US-EAST-1', 'EU-CENTRAL-1', 'AP-SOUTHEAST-1', 'US-WEST-2']),
        policy_id: `POL-${randInt(100, 999)}`
      }
    };

    logs.push(logEntry);
  }

  // Sort chronologically descending (newest first)
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Re-index IDs cleanly in chronological order
  logs.forEach((log, index) => {
    log.id = `log-${String(index + 1).padStart(4, '0')}`;
  });

  return logs;
}

const count = 500;
const logs = generateLogs(count);

// 1. Array format (standard for frontend UI Bulk upload & direct JSON consumption)
const arrayFilePath = path.join(__dirname, '..', 'bulk-500-security-logs.json');
fs.writeFileSync(arrayFilePath, JSON.stringify(logs, null, 2), 'utf-8');

// 2. Object format with { logs: [...] } (exact backend POST /logs/bulk payload)
const payloadFilePath = path.join(__dirname, '..', 'bulk-500-security-logs-payload.json');
fs.writeFileSync(payloadFilePath, JSON.stringify({ logs }, null, 2), 'utf-8');

console.log(`Successfully generated ${count} security logs!`);
console.log(`- Array format:   ${arrayFilePath} (${(fs.statSync(arrayFilePath).size / 1024).toFixed(1)} KB)`);
console.log(`- Payload format: ${payloadFilePath} (${(fs.statSync(payloadFilePath).size / 1024).toFixed(1)} KB)`);
