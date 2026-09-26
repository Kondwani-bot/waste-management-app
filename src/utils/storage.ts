import { WasteReport } from '../types';
import { INITIAL_REPORTS } from '../data/mockData';

const STORAGE_KEY = 'swms_waste_reports_v2';
const LIKES_KEY = 'swms_liked_reports_v2';
const ONBOARDING_KEY = 'swms_onboarding_viewed';

function getLikedReportIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    if (!raw) return new Set(['report-103']); // default liked demo
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveLikedReportIds(set: Set<string>): void {
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function getStoredReports(): WasteReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const likedIds = getLikedReportIds();

    if (!raw) {
      // Seed with initial realistic demo reports
      const seeded = INITIAL_REPORTS.map((r) => ({
        ...r,
        isLikedByUser: likedIds.has(r.id),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const parsed: WasteReport[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }

    return parsed.map((r) => ({
      ...r,
      isLikedByUser: likedIds.has(r.id),
      likesCount: r.likesCount ?? 0,
    }));
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
    likesCount: 0,
    isLikedByUser: false,
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

export function toggleReportLike(reportId: string): WasteReport[] {
  const reports = getStoredReports();
  const likedIds = getLikedReportIds();
  const isCurrentlyLiked = likedIds.has(reportId);

  if (isCurrentlyLiked) {
    likedIds.delete(reportId);
  } else {
    likedIds.add(reportId);
  }
  saveLikedReportIds(likedIds);

  const updated = reports.map((r) => {
    if (r.id === reportId) {
      const currentCount = r.likesCount ?? 0;
      const newCount = isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
      return {
        ...r,
        likesCount: newCount,
        isLikedByUser: !isCurrentlyLiked,
      };
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('swms-reports-updated'));
  } catch (e) {
    console.error('Failed to update like in localStorage', e);
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
