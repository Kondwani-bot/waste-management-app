import { WasteReport } from '../types';
import { INITIAL_REPORTS } from '../data/mockData';

const STORAGE_KEY = 'swms_waste_reports_v1';
const ONBOARDING_KEY = 'swms_onboarding_viewed';

export function getStoredReports(): WasteReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic demo reports
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_REPORTS;
  } catch (err) {
    console.error('Error reading localStorage', err);
    return INITIAL_REPORTS;
  }
}

export function saveNewReport(report: Omit<WasteReport, 'id' | 'timestamp' | 'status'>): WasteReport {
  const reports = getStoredReports();
  const newReport: WasteReport = {
    ...report,
    id: `report-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    status: 'pending',
  };
  const updated = [newReport, ...reports];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('swms-reports-updated'));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
  return newReport;
}

export function completeReportTask(reportId: string): WasteReport[] {
  const reports = getStoredReports();
  const updated = reports.map((r) =>
    r.id === reportId
      ? { ...r, status: 'completed' as const, completedAt: Date.now() }
      : r
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('swms-reports-updated'));
  } catch (e) {
    console.error('Failed to update report in localStorage', e);
  }
  return updated;
}

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // ignore
  }
}
