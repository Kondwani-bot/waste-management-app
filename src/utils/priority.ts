import { WasteReport, PriorityTier } from '../types';

/**
 * Calculates distance in kilometers between two GPS coordinates using the Haversine formula
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Normalizes location strings to match common areas (e.g. Cairo Road, Kitwe Market)
 */
function normalizeLocation(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two reports are considered the "same location / same hotspot"
 * - Within 450 meters (0.45 km)
 * - OR location names share significant tokens (e.g., "Cairo Road")
 * - OR same photo URL
 */
export function areReportsInSameLocation(r1: WasteReport, r2: WasteReport): boolean {
  if (r1.id === r2.id) return true;

  // Exact photo match
  if (r1.photoUrl && r2.photoUrl && r1.photoUrl === r2.photoUrl) {
    return true;
  }

  // GPS distance check (within ~400 meters)
  if (r1.latitude != null && r1.longitude != null && r2.latitude != null && r2.longitude != null) {
    const dist = getDistanceKm(r1.latitude, r1.longitude, r2.latitude, r2.longitude);
    if (dist <= 0.45) {
      return true;
    }
  }

  // Text location matching
  const n1 = normalizeLocation(r1.locationName || '');
  const n2 = normalizeLocation(r2.locationName || '');
  if (n1 && n2) {
    if (n1 === n2) return true;
    const words1 = n1.split(' ').filter((w) => w.length > 3);
    const words2 = n2.split(' ').filter((w) => w.length > 3);
    const common = words1.filter((w) => words2.includes(w));
    if (common.length >= 2) return true;
  }

  return false;
}

export interface ReportPriorityInfo {
  tier: PriorityTier;
  clusterCount: number;
  clusterReports: WasteReport[];
  reason: string;
}

/**
 * Computes priority tier for a report based on repeated submissions in the same area:
 * - HIGH: 3 or more submissions in the same area
 * - MEDIUM: 2 submissions in the same area
 * - STANDARD: 1 submission
 */
export function calculateReportPriority(
  report: WasteReport,
  allReports: WasteReport[]
): ReportPriorityInfo {
  const clusterReports = allReports.filter((other) => areReportsInSameLocation(report, other));
  const count = clusterReports.length;

  if (count >= 3) {
    return {
      tier: 'high',
      clusterCount: count,
      clusterReports,
      reason: `High Priority: ${count} separate citizen reports logged in this exact area!`,
    };
  }

  if (count === 2) {
    return {
      tier: 'medium',
      clusterCount: count,
      clusterReports,
      reason: `Medium Priority: 2 citizen reports logged in this area.`,
    };
  }

  return {
    tier: 'standard',
    clusterCount: 1,
    clusterReports: [report],
    reason: `Standard Priority: Single citizen incident report.`,
  };
}
