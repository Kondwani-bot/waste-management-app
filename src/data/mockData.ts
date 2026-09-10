import { WasteReport } from '../types';

export const ZAMBIA_PROVINCES = [
  'Lusaka',
  'Copperbelt',
  'Central',
  'Eastern',
  'Southern',
  'Western',
  'North-Western',
  'Northern',
  'Luapula',
  'Muchinga',
] as const;

export const INITIAL_REPORTS: WasteReport[] = [
  {
    id: 'report-101',
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
    locationName: 'Cairo Road, Near City Market',
    province: 'Lusaka',
    latitude: -15.4208,
    longitude: 28.2833,
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    status: 'pending',
  },
  {
    id: 'report-102',
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    locationName: 'Chawama Ward 2, Clinic Road',
    province: 'Lusaka',
    latitude: -15.4431,
    longitude: 28.2712,
    timestamp: Date.now() - 1000 * 60 * 180, // 3 hours ago
    status: 'pending',
  },
  {
    id: 'report-103',
    photoUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80',
    locationName: 'Kalingalinga Market Junction',
    province: 'Lusaka',
    latitude: -15.4089,
    longitude: 28.3417,
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    status: 'completed',
    completedAt: Date.now() - 1000 * 60 * 60 * 6,
  },
];
