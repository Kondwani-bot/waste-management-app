export interface WasteReport {
  id: string;
  photoUrl: string;
  mediaUrl?: string;
  mediaType?: 'photo' | 'video';
  locationName: string;
  province: string;
  latitude?: number;
  longitude?: number;
  timestamp: number;
  status: 'pending' | 'completed';
  completedAt?: number;
  reporterName?: string;
  reporterPhone?: string;
}

export interface OnboardingStep {
  step: number;
  title: string;
  action: string;
  description: string;
}

export type AppView = 'reporter' | 'admin';
