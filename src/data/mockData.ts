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
  // Cluster 1: Cairo Road / City Market (3 reports -> HIGH PRIORITY)
  {
    id: 'report-101',
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    mediaType: 'photo',
    locationName: 'Cairo Road, Near City Market Alley 4',
    province: 'Lusaka',
    latitude: -15.420815,
    longitude: 28.283342,
    geoMetadata: {
      latitude: -15.420815,
      longitude: 28.283342,
      accuracy: 3.4,
      capturedAt: Date.now() - 1000 * 60 * 25,
      provider: 'gps-sensor',
    },
    timestamp: Date.now() - 1000 * 60 * 25, // 25 mins ago
    status: 'pending',
    reporterName: 'Moses Banda',
    reporterPhone: '+260 977 452 119',
    likesCount: 29,
    isLikedByUser: false,
  },
  {
    id: 'report-105',
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    mediaType: 'photo',
    locationName: 'Cairo Road, City Market Bus Stop Gate 2',
    province: 'Lusaka',
    latitude: -15.421210,
    longitude: 28.283890,
    geoMetadata: {
      latitude: -15.421210,
      longitude: 28.283890,
      accuracy: 4.8,
      capturedAt: Date.now() - 1000 * 60 * 50,
      provider: 'gps-sensor',
    },
    timestamp: Date.now() - 1000 * 60 * 50, // 50 mins ago
    status: 'pending',
    reporterName: 'Brenda Tembo',
    reporterPhone: '+260 971 832 990',
    likesCount: 17,
    isLikedByUser: false,
  },
  {
    id: 'report-106',
    photoUrl: 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?auto=format&fit=crop&w=800&q=80',
    mediaType: 'photo',
    locationName: 'Cairo Road North Junction & Lumumba Link',
    province: 'Lusaka',
    latitude: -15.420100,
    longitude: 28.282910,
    geoMetadata: {
      latitude: -15.420100,
      longitude: 28.282910,
      accuracy: 2.9,
      capturedAt: Date.now() - 1000 * 60 * 90,
      provider: 'gps-sensor',
    },
    timestamp: Date.now() - 1000 * 60 * 90, // 1.5 hrs ago
    status: 'pending',
    likesCount: 12,
    isLikedByUser: false,
  },

  // Cluster 2: Chawama (2 reports -> MEDIUM PRIORITY)
  {
    id: 'report-102',
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    mediaType: 'photo',
    locationName: 'Chawama Ward 2, Clinic Road Drainage',
    province: 'Lusaka',
    latitude: -15.443120,
    longitude: 28.271240,
    geoMetadata: {
      latitude: -15.443120,
      longitude: 28.271240,
      accuracy: 5.1,
      capturedAt: Date.now() - 1000 * 60 * 180,
      provider: 'gps-sensor',
    },
    timestamp: Date.now() - 1000 * 60 * 180, // 3 hours ago
    status: 'pending',
    likesCount: 8,
    isLikedByUser: false,
  },
  {
    id: 'report-107',
    photoUrl: 'https://images.unsplash.com/photo-1611288875785-5a714a601269?auto=format&fit=crop&w=800&q=80',
    mediaType: 'photo',
    locationName: 'Chawama Clinic Road, Near Market Entrance',
    province: 'Lusaka',
    latitude: -15.443580,
    longitude: 28.271890,
    geoMetadata: {
      latitude: -15.443580,
      longitude: 28.271890,
      accuracy: 4.1,
      capturedAt: Date.now() - 1000 * 60 * 210,
      provider: 'gps-sensor',
    },
    timestamp: Date.now() - 1000 * 60 * 210, // 3.5 hours ago
    status: 'pending',
    reporterName: 'Kennedy Phiri',
    reporterPhone: '+260 979 332 108',
    likesCount: 14,
    isLikedByUser: false,
  },

  // Copperbelt Report
  {
    id: 'report-104',
    photoUrl: 'https://images.unsplash.com/photo-1516992654410-9309d4587e94?auto=format&fit=crop&w=800&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    mediaType: 'video',
    locationName: 'Kitwe Central Market Overflow Bin',
    province: 'Copperbelt',
    latitude: -12.802410,
    longitude: 28.213230,
    geoMetadata: {
      latitude: -12.802410,
      longitude: 28.213230,
      accuracy: 6.2,
      capturedAt: Date.now() - 1000 * 60 * 120,
      provider: 'gps-sensor',
    },
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    status: 'pending',
    reporterName: 'Chileshe Mulenga',
    reporterPhone: '+260 966 881 204',
    likesCount: 21,
    isLikedByUser: false,
  },

  // Cleaned Place 1 (Lusaka Kalingalinga)
  {
    id: 'report-103',
    photoUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    mediaType: 'photo',
    locationName: 'Kalingalinga Market Junction (Cleared)',
    province: 'Lusaka',
    latitude: -15.408910,
    longitude: 28.341720,
    geoMetadata: {
      latitude: -15.408910,
      longitude: 28.341720,
      accuracy: 3.8,
      capturedAt: Date.now() - 1000 * 60 * 60 * 36,
      provider: 'gps-sensor',
    },
    timestamp: Date.now() - 1000 * 60 * 60 * 36,
    status: 'completed',
    completedAt: Date.now() - 1000 * 60 * 60 * 8, // Cleared 8 hours ago
    reporterName: 'Grace Mutale',
    reporterPhone: '+260 955 120 744',
    likesCount: 64,
    isLikedByUser: true,
  },

  // Cleaned Place 2 (Ndola)
  {
    id: 'report-108',
    photoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    mediaType: 'photo',
    locationName: 'Ndola Broadway Public Park & Bus Terminus',
    province: 'Copperbelt',
    latitude: -12.969100,
    longitude: 28.636600,
    geoMetadata: {
      latitude: -12.969100,
      longitude: 28.636600,
      accuracy: 2.5,
      capturedAt: Date.now() - 1000 * 60 * 60 * 48,
      provider: 'gps-sensor',
    },
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    status: 'completed',
    completedAt: Date.now() - 1000 * 60 * 60 * 14, // Cleared 14 hours ago
    likesCount: 88,
    isLikedByUser: false,
  },
];
