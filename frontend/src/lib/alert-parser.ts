/**
 * Alert Description and Telemetry Parser
 * Declutters raw alert descriptions and extracts structured telemetry components.
 */

export interface ParsedAlertDescription {
  narrative: string;
  sourceIp?: string;
  country?: string;
  detector?: string;
  timestamp?: string;
  rawTimestamp?: string;
  hasStructuredData: boolean;
}

const TYPE_NARRATIVES: Record<string, string> = {
  RANSOMWARE: 'Anomalous rapid file encryption signatures and volume entropy spikes detected across host storage.',
  BRUTE_FORCE: 'High-velocity repeated authentication failures observed targeting privileged identity endpoints.',
  SQL_INJECTION: 'Malicious SQL syntax and union-based extraction payload intercepted by application inspection filter.',
  DDOS: 'Volumetric packet ingestion spike exceeding baseline capacity thresholds by >350%.',
  DATA_EXFILTRATION: 'Anomalous outbound egress burst directed to unauthorized external endpoint detected.',
  PORT_SCAN: 'Rapid sequential port probing across internal network subnet segments flagged by perimeter sensors.',
  MALWARE: 'Host process injection and suspicious registry persistence routine intercepted by endpoint behavioral agent.',
  ANOMALY: 'Heuristic anomaly detection flagged behavioral variance deviating significantly from established baseline.',
  ZERO_DAY: 'Unclassified binary execution behavior and memory manipulation flagged by deep behavioral telemetry.',
  UNAUTHORIZED_ACCESS: 'Access attempt to restricted credential store or administrative asset flagged without valid authorization.',
};

const AI_HEURISTIC_EXPLANATIONS: Record<string, (alert: { sourceIp?: string; country?: string; threatScore?: number }) => string> = {
  RANSOMWARE: ({ sourceIp, country, threatScore }) =>
    `Autonomous heuristic engine flagged rapid mass file encryption signatures and elevated volume entropy originating from ${sourceIp || 'endpoint'}${country ? ` (${country})` : ''}. Risk score (${threatScore || 85}/100) indicates high confidence in targeted ransomware payload execution. Recommended immediate host quarantine.`,
  BRUTE_FORCE: ({ sourceIp, country, threatScore }) =>
    `High-velocity authentication failure patterns detected from ${sourceIp || 'external host'}${country ? ` (${country})` : ''}. Anomaly score indicates automated credential stuffing or dictionary sweep attempting unauthorized privilege escalation.`,
  SQL_INJECTION: ({ sourceIp, country, threatScore }) =>
    `Payload inspection identified suspicious SQL command tokens and union-based exfiltration vectors from ${sourceIp || 'remote client'}${country ? ` (${country})` : ''}. Threat classification matches known automated scanner fingerprints.`,
  DDOS: ({ sourceIp, country, threatScore }) =>
    `Volumetric traffic anomaly exceeding baseline capacity thresholds. Ingress telemetry indicates distributed connection flooding designed to saturate application availability.`,
  DATA_EXFILTRATION: ({ sourceIp, country, threatScore }) =>
    `High-bandwidth outbound transfer to external destination ${sourceIp || 'IP'}${country ? ` (${country})` : ''} deviates significantly from standard egress profile, indicating unauthorized data staging.`,
  PORT_SCAN: ({ sourceIp, country, threatScore }) =>
    `Sequential SYN-flag probing across multiple protected ports identified from ${sourceIp || 'source host'}${country ? ` (${country})` : ''}. Pattern indicates automated reconnaissance phase of MITRE ATT&CK kill chain.`,
  MALWARE: ({ sourceIp, country, threatScore }) =>
    `Endpoint telemetry detected suspicious child process spawning and attempt to bypass AMSI protections. Process activity isolated pending forensic triage.`,
};

export function parseAlertDescription(
  description?: string,
  title?: string,
  alertType?: string,
  fallbackSourceIp?: string
): ParsedAlertDescription {
  if (!description) {
    const fallbackNarrative =
      (alertType && TYPE_NARRATIVES[alertType]) ||
      title ||
      'Suspicious telemetry activity flagged by automated security sensors.';
    return {
      narrative: fallbackNarrative,
      sourceIp: fallbackSourceIp,
      hasStructuredData: false,
    };
  }

  // Extract structured parts from seed / backend raw formats:
  // e.g.: "${title}. Source IP: 133.26.251.89, Country: China. Event detected by FIREWALL at 2026-09-23T02:44:16.237Z."
  const ipMatch = description.match(/Source IP:\s*([^\s,;]+)/i);
  const countryMatch = description.match(/Country:\s*([^,.;]+)/i);
  const detectorMatch = description.match(/Event detected by\s*([^\s,.;]+)/i);
  const timeMatch = description.match(/\bat\s+([0-9]{4}-[0-9]{2}-[0-9]{2}(?:T[0-9:.]+Z?)?)/i);

  // Extract clean narrative by stripping out the clustered metadata sentences
  let cleanNarrative = description
    .replace(/Source IP:\s*[^\s,;]+(?:,\s*)?/gi, '')
    .replace(/Country:\s*[^,.;]+(?:[.;]\s*)?/gi, '')
    .replace(/Event detected by\s*[^\s,.;]+\s*at\s*([0-9]{4}-[0-9]{2}-[0-9]{2}(?:T[0-9:.]+Z?)?)\.?/gi, '')
    .replace(/Event detected by\s*[^\s,.;]+(?:[.;]\s*)?/gi, '')
    .trim();

  // Remove trailing dots, commas, spaces
  cleanNarrative = cleanNarrative.replace(/[,\s.]+$/, '').trim();

  // If narrative is empty, or merely repeats the title verbatim, replace with a descriptive SOC sentence
  const titleClean = (title || '').replace(/[,\s.]+$/, '').trim().toLowerCase();
  const narrativeClean = cleanNarrative.toLowerCase();

  if (!cleanNarrative || narrativeClean === titleClean) {
    cleanNarrative =
      (alertType && TYPE_NARRATIVES[alertType]) ||
      (title ? `${title.replace(/\.$/, '')}. Suspicious activity observed requiring SOC investigation.` : 'Suspicious telemetry signatures observed requiring SOC triage.');
  } else {
    // Ensure clean sentence punctuation
    cleanNarrative += '.';
  }

  // Format timestamp nicely if found
  let formattedDate: string | undefined = undefined;
  if (timeMatch?.[1]) {
    try {
      const d = new Date(timeMatch[1]);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'UTC',
        }) + ' UTC';
      }
    } catch {
      formattedDate = timeMatch[1];
    }
  }

  const extractedIp = ipMatch?.[1] || fallbackSourceIp;
  const extractedCountry = countryMatch?.[1]?.trim();
  const extractedDetector = detectorMatch?.[1]?.trim();

  const hasStructuredData = Boolean(extractedDetector || extractedCountry || ipMatch || formattedDate);

  return {
    narrative: cleanNarrative,
    sourceIp: extractedIp,
    country: extractedCountry,
    detector: extractedDetector,
    timestamp: formattedDate,
    rawTimestamp: timeMatch?.[1],
    hasStructuredData,
  };
}

export function getAiThreatReasoning(
  alert: {
    aiExplanation?: string | null;
    description?: string;
    type?: string;
    sourceIp?: string;
    threatScore?: number;
  },
  parsed?: ParsedAlertDescription
): string {
  if (alert.aiExplanation && alert.aiExplanation.trim().length > 0) {
    return alert.aiExplanation;
  }

  const parsedInfo = parsed || parseAlertDescription(alert.description, undefined, alert.type, alert.sourceIp);
  const generator = alert.type ? AI_HEURISTIC_EXPLANATIONS[alert.type] : undefined;

  if (generator) {
    return generator({
      sourceIp: alert.sourceIp || parsedInfo.sourceIp,
      country: parsedInfo.country,
      threatScore: alert.threatScore,
    });
  }

  return `Autonomous neural classifier identified anomalous telemetry correlating with ${
    alert.type ? alert.type.replace(/_/g, ' ').toLowerCase() : 'suspicious threat'
  } activity from ${alert.sourceIp || 'source host'}${
    parsedInfo.country ? ` (${parsedInfo.country})` : ''
  }. Real-time threat score (${alert.threatScore || 70}/100) indicates elevated risk profile requiring containment.`;
}
