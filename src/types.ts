export interface GeoMetadata {
  latitude: number;
  longitude: number;
  accuracy?: number; // Accuracy in meters e.g. 4.5
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  capturedAt: number; // Exact timestamp the GPS fix was logged
  provider?: 'gps-sensor' | 'browser-geolocation' | 'manual-pin';
}

export type PriorityTier = 'high' | 'medium' | 'standard';

export interface WasteReport {
  id: string;
  photoUrl: string;
  mediaUrl?: string;
  mediaType?: 'photo' | 'video';
  locationName: string;
  province: string;
  latitude?: number;
  longitude?: number;
  geoMetadata?: GeoMetadata;
  timestamp: number;
  status: 'pending' | 'completed';
  completedAt?: number;
  reporterName?: string;
  reporterPhone?: string;
  likesCount?: number;
  isLikedByUser?: boolean;
}

export interface OnboardingStep {
  step: number;
  title: string;
  action: string;
  description: string;
}

export type AppView = 'home' | 'reporter' | 'admin';
