export interface User {
  id: string;
  email: string;
  role: 'OWNER' | 'STAFF';
  vkId?: string;
}

export interface Business {
  id: string;
  name: string;
  address?: string;
  timezone: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  photo?: string;
  workingHours?: WorkingHours;
  notificationSettings?: NotificationSettings;
  createdAt: string;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  start: string;
  end: string;
  isWorking: boolean;
}

export interface Service {
  id: string;
  title: string;
  durationMinutes: number;
  price: number;
  bufferBefore?: number;
  bufferAfter?: number;
  color?: string;
}

export interface Staff {
  id: string;
  name: string;
  phone?: string;
  serviceIds?: string[];
  staffServices?: StaffService[];
}

export interface StaffService {
  id: string;
  service: Service;
}

export interface Booking {
  id: string;
  serviceId: string;
  staffId: string;
  clientId?: string;
  startTs: string;
  endTs: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  source: 'VK' | 'WEB' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  // Relations
  service?: Service;
  staff?: Staff;
  client?: Client;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  // Relations
  bookings?: Booking[];
}

export interface Notification {
  id: string;
  businessId: string;
  bookingId: string;
  clientId: string;
  type: 'SMS' | 'EMAIL' | 'VK';
  template: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_REMINDER';
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  scheduledFor: string;
  sentAt?: string;
  createdAt: string;
  // Relations
  booking?: Booking;
  client?: Client;
}

export interface NotificationSettings {
  smsEnabled: boolean;
  emailEnabled: boolean;
  vkEnabled: boolean;
  reminderHours: number[];
  confirmationTemplate: string;
  reminderTemplate: string;
  cancellationTemplate: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
