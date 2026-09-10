export interface WasteReport {
  id: string;
  photoUrl: string;
  locationName: string;
  province: string;
  latitude?: number;
  longitude?: number;
  timestamp: number;
  status: 'pending' | 'completed';
  completedAt?: number;
}

export interface OnboardingStep {
  step: number;
  title: string;
  action: string;
  description: string;
}

export type AppView = 'reporter' | 'admin';
