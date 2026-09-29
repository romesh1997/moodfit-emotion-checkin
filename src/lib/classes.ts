import type { Intensity } from './recommendation';

export interface GymClass {
  id: string;
  title: string;
  category: string;
  instructor: string;
  day: string;
  time: string;
  durationMinutes: number;
  intensity: Intensity;
  spotsTotal: number;
  location: string;
}

export function getClassById(id: string): GymClass | undefined {
  return CLASSES.find((gymClass) => gymClass.id === id);
}

export const CLASSES: GymClass[] = [
  {
    id: 'sunrise-yoga',
    title: 'Sunrise Yoga',
    category: 'Yoga',
    instructor: 'Priya Nair',
    day: 'Mon',
    time: '6:30 AM',
    durationMinutes: 45,
    intensity: 'Low',
    spotsTotal: 16,
    location: 'Studio A',
  },
  {
    id: 'hiit-blast',
    title: 'HIIT Blast',
    category: 'HIIT',
    instructor: 'Marcus Webb',
    day: 'Mon',
    time: '6:00 PM',
    durationMinutes: 30,
    intensity: 'High',
    spotsTotal: 20,
    location: 'Main Floor',
  },
  {
    id: 'power-cycle',
    title: 'Power Cycle',
    category: 'Cycling',
    instructor: 'Dana Ruiz',
    day: 'Tue',
    time: '7:00 AM',
    durationMinutes: 45,
    intensity: 'High',
    spotsTotal: 24,
    location: 'Cycle Studio',
  },
  {
    id: 'strength-fundamentals',
    title: 'Strength Fundamentals',
    category: 'Strength',
    instructor: 'Marcus Webb',
    day: 'Tue',
    time: '5:30 PM',
    durationMinutes: 50,
    intensity: 'Moderate',
    spotsTotal: 14,
    location: 'Weight Room',
  },
  {
    id: 'restorative-pilates',
    title: 'Restorative Pilates',
    category: 'Pilates',
    instructor: 'Priya Nair',
    day: 'Wed',
    time: '9:00 AM',
    durationMinutes: 40,
    intensity: 'Low',
    spotsTotal: 16,
    location: 'Studio A',
  },
  {
    id: 'boxing-fundamentals',
    title: 'Boxing Fundamentals',
    category: 'Boxing',
    instructor: 'Aisha Bello',
    day: 'Wed',
    time: '6:00 PM',
    durationMinutes: 45,
    intensity: 'High',
    spotsTotal: 18,
    location: 'Main Floor',
  },
  {
    id: 'full-body-circuit',
    title: 'Full-Body Circuit',
    category: 'Strength',
    instructor: 'Dana Ruiz',
    day: 'Thu',
    time: '6:00 PM',
    durationMinutes: 40,
    intensity: 'Moderate',
    spotsTotal: 20,
    location: 'Main Floor',
  },
  {
    id: 'gentle-flow-yoga',
    title: 'Gentle Flow Yoga',
    category: 'Yoga',
    instructor: 'Priya Nair',
    day: 'Fri',
    time: '7:30 AM',
    durationMinutes: 45,
    intensity: 'Low',
    spotsTotal: 16,
    location: 'Studio A',
  },
  {
    id: 'saturday-spin',
    title: 'Saturday Spin',
    category: 'Cycling',
    instructor: 'Aisha Bello',
    day: 'Sat',
    time: '9:00 AM',
    durationMinutes: 45,
    intensity: 'High',
    spotsTotal: 24,
    location: 'Cycle Studio',
  },
];
