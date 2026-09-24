'use client';

import {
  mockDashboardStats,
  mockSecurityLogs,
  mockRecentActivity,
  mockSeverityDistribution,
  mockTopSources,
  mockAttackFrequency,
} from './mock-data';
import type {
  SecurityLog,
  DashboardStats,
  RecentActivity,
  SeverityDistribution,
  TopSource,
  AttackFrequency,
  LogSeverity,
} from '@/types';

const STORAGE_KEY = 'cybershield_custom_logs_v1';
export const BASE_TOTAL_LOGS = 1248563; // 1.25M baseline scale
export const BASE_TOTAL_ALERTS = 3847;
export const BASE_CRITICAL_ALERTS = 23;
export const BASE_BLOCKED_IPS = 8942;

export class TelemetryStore {
  private static instance: TelemetryStore;

  private getStorage(): SecurityLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? (JSON.parse(data) as SecurityLog[]) : [];
    } catch {
      return [];
    }
  }

  private setStorage(logs: SecurityLog[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      window.dispatchEvent(new CustomEvent('telemetry-updated'));
    } catch {
      // Storage quota or disabled
    }
  }

  public getUploadedLogs(): SecurityLog[] {
    return this.getStorage();
  }

  public ingestLog(
    logData: Partial<SecurityLog> & { sourceIp: string; destinationIp: string; message: string }
  ): SecurityLog {
    const existing = this.getStorage();
    const newLog: SecurityLog = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: logData.timestamp || new Date().toISOString(),
      sourceIp: logData.sourceIp,
      destinationIp: logData.destinationIp,
      sourcePort: Number(logData.sourcePort) || 443,
      destinationPort: Number(logData.destinationPort) || 80,
      protocol: logData.protocol || 'TCP',
      action: logData.action || 'DENY',
      severity: logData.severity || 'HIGH',
      source: logData.source || 'FIREWALL',
      eventType: logData.eventType || 'SUSPICIOUS_INGESTION',
      message: logData.message,
      country: logData.country || 'GLOBAL',
      city: logData.city || 'Network',
      latitude: null,
      longitude: null,
      userId: null,
      userName: null,
      threatScore: logData.threatScore ?? (logData.severity === 'CRITICAL' ? 95 : logData.severity === 'HIGH' ? 75 : 45),
      isThreat: logData.severity === 'CRITICAL' || logData.severity === 'HIGH',
      createdAt: new Date().toISOString(),
    };

    const updated = [newLog, ...existing];
    this.setStorage(updated);
    return newLog;
  }

  public ingestBulkLogs(logs: Partial<SecurityLog>[]): SecurityLog[] {
    const existing = this.getStorage();
    const formattedLogs: SecurityLog[] = logs.map((logData, idx) => ({
      id: `usr-bulk-${Date.now()}-${idx}`,
      timestamp: logData.timestamp || new Date(Date.now() - idx * 1000).toISOString(),
      sourceIp: logData.sourceIp || '192.168.1.100',
      destinationIp: logData.destinationIp || '10.0.0.1',
      sourcePort: Number(logData.sourcePort) || 443,
      destinationPort: Number(logData.destinationPort) || 80,
      protocol: logData.protocol || 'TCP',
      action: logData.action || 'DENY',
      severity: logData.severity || 'HIGH',
      source: logData.source || 'FIREWALL',
      eventType: logData.eventType || 'BULK_IMPORT',
      message: logData.message || 'Imported security event',
      country: logData.country || 'GLOBAL',
      city: logData.city || 'Network',
      latitude: null,
      longitude: null,
      userId: null,
      userName: null,
      threatScore: logData.threatScore ?? 75,
      isThreat: true,
      createdAt: new Date().toISOString(),
    }));

    const updated = [...formattedLogs, ...existing];
    this.setStorage(updated);
    return formattedLogs;
  }

  public getSynchronizedStats(base?: DashboardStats | null): DashboardStats {
    const uploaded = this.getStorage();
    const criticalCount = uploaded.filter((l) => l.severity === 'CRITICAL').length;
    const highAlertCount = uploaded.filter((l) => l.severity === 'CRITICAL' || l.severity === 'HIGH').length;
    const blockedCount = uploaded.filter((l) => l.action === 'DENY' || l.action === 'DROP').length;

    const baseLogs = base?.totalLogs ?? BASE_TOTAL_LOGS;
    const baseAlerts = base?.totalAlerts ?? BASE_TOTAL_ALERTS;
    const baseCritical = base?.criticalAlerts ?? BASE_CRITICAL_ALERTS;
    const baseBlocked = base?.blockedIps ?? BASE_BLOCKED_IPS;

    return {
      totalLogs: baseLogs + uploaded.length,
      totalAlerts: baseAlerts + highAlertCount,
      criticalAlerts: baseCritical + criticalCount,
      highRiskUsers: base?.highRiskUsers ?? mockDashboardStats.highRiskUsers,
      blockedIps: baseBlocked + blockedCount,
      avgThreatScore: base?.avgThreatScore ?? mockDashboardStats.avgThreatScore,
    };
  }

  public getSynchronizedRecentActivity(base?: RecentActivity[] | null): RecentActivity[] {
    const uploaded = this.getStorage();
    const convertedUploaded: RecentActivity[] = uploaded.slice(0, 10).map((l) => ({
      id: String(l.id || l._id),
      timestamp: l.timestamp,
      type: l.eventType,
      severity: l.severity,
      message: l.message,
      sourceIp: l.sourceIp,
    }));

    const baseList = base ?? mockRecentActivity;
    return [...convertedUploaded, ...baseList].slice(0, 20);
  }

  public getSynchronizedLogs(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      search?: string;
      severities?: LogSeverity[];
      sources?: string[];
      ip?: string;
      country?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): { logs: SecurityLog[]; total: number } {
    const uploaded = this.getStorage();
    let combined = [...uploaded, ...mockSecurityLogs];

    const hasFilters =
      Boolean(filters?.search) ||
      Boolean(filters?.severities?.length) ||
      Boolean(filters?.sources?.length) ||
      Boolean(filters?.ip) ||
      Boolean(filters?.country) ||
      Boolean(filters?.startDate) ||
      Boolean(filters?.endDate);

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      combined = combined.filter(
        (l) =>
          l.sourceIp?.toLowerCase().includes(s) ||
          l.destinationIp?.toLowerCase().includes(s) ||
          l.message?.toLowerCase().includes(s) ||
          l.eventType?.toLowerCase().includes(s) ||
          l.country?.toLowerCase().includes(s)
      );
    }

    if (filters?.severities && filters.severities.length > 0) {
      combined = combined.filter((l) => filters.severities!.includes(l.severity));
    }

    if (filters?.sources && filters.sources.length > 0) {
      combined = combined.filter((l) => filters.sources!.includes(l.source));
    }

    if (filters?.ip) {
      const ip = filters.ip;
      combined = combined.filter((l) => l.sourceIp?.includes(ip) || l.destinationIp?.includes(ip));
    }

    if (filters?.country) {
      const c = filters.country.toLowerCase();
      combined = combined.filter((l) => l.country?.toLowerCase().includes(c));
    }

    if (filters?.startDate) {
      combined = combined.filter((l) => new Date(l.timestamp) >= new Date(filters.startDate!));
    }

    if (filters?.endDate) {
      combined = combined.filter((l) => new Date(l.timestamp) <= new Date(filters.endDate! + 'T23:59:59'));
    }

    // Sort
    const sortBy = filters?.sortBy || 'timestamp';
    const sortOrder = filters?.sortOrder || 'desc';

    combined.sort((a, b) => {
      const aVal = a[sortBy as keyof SecurityLog];
      const bVal = b[sortBy as keyof SecurityLog];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    // If no specific narrow search filter is active, return the true enterprise scale total (1.2M + uploaded)
    // so the logs table and dashboard stay 100% in sync
    const total = hasFilters
      ? combined.length
      : BASE_TOTAL_LOGS + uploaded.length;

    const start = (page - 1) * perPage;
    const sliced = combined.slice(start, start + perPage);

    return { logs: sliced, total };
  }

  public getSynchronizedSeverityDistribution(
    base?: SeverityDistribution[] | null
  ): SeverityDistribution[] {
    const uploaded = this.getStorage();
    const baseDist = base ?? mockSeverityDistribution;
    if (uploaded.length === 0) return baseDist;

    const counts: Record<string, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };

    baseDist.forEach((item) => {
      counts[item.name] = (counts[item.name] || 0) + item.value;
    });

    uploaded.forEach((log) => {
      const name = log.severity.charAt(0) + log.severity.slice(1).toLowerCase();
      if (counts[name] !== undefined) {
        counts[name] += 1;
      }
    });

    return [
      { name: 'Critical', value: counts['Critical'], color: '#ef4444' },
      { name: 'High', value: counts['High'], color: '#f97316' },
      { name: 'Medium', value: counts['Medium'], color: '#eab308' },
      { name: 'Low', value: counts['Low'], color: '#22c55e' },
    ];
  }

  public getSynchronizedTopSources(base?: TopSource[] | null): TopSource[] {
    const uploaded = this.getStorage();
    const baseSources = base ?? mockTopSources;
    if (uploaded.length === 0) return baseSources;

    const map = new Map<string, TopSource>();
    baseSources.forEach((s) => map.set(s.ip, { ...s }));

    uploaded.forEach((log) => {
      if (map.has(log.sourceIp)) {
        const existing = map.get(log.sourceIp)!;
        existing.count += 1;
      } else {
        map.set(log.sourceIp, {
          ip: log.sourceIp,
          country: log.country || 'GLOBAL',
          count: 1,
          threatLevel: log.severity,
        });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  public clearUploadedLogs(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('telemetry-updated'));
  }
}

export const telemetryStore = new TelemetryStore();
export default telemetryStore;
