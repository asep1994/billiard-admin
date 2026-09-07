import type { VenueFacility } from './types';

export const FACILITY_OPTIONS: { value: VenueFacility; label: string }[] = [
  { value: 'parking', label: 'Parkir Gratis' },
  { value: 'ac', label: 'AC Ruangan' },
  { value: 'food_drink', label: 'Makanan & Minuman' },
  { value: 'wifi', label: 'WiFi Gratis' },
];
