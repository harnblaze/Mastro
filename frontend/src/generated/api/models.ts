export interface VkAuthDto {
  vkToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  vkId?: string;
  role?: 'OWNER' | 'STAFF';
}

export interface CreateBusinessDto {
  name: string;
  address?: string;
  timezone?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  workingHours?: object;
}

export interface UpdateBusinessDto {
  name?: string;
  address?: string;
  timezone?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  workingHours?: object;
}

export interface CreateServiceDto {
  title: string;
  durationMinutes: number;
  price: number;
  bufferBefore?: number;
  bufferAfter?: number;
  color?: string;
}

export interface UpdateServiceDto {
  title?: string;
  durationMinutes?: number;
  price?: number;
  bufferBefore?: number;
  bufferAfter?: number;
  color?: string;
}

export interface CreateStaffDto {
  name: string;
  phone?: string;
  serviceIds?: string[];
}

export interface UpdateStaffDto {
  name?: string;
  phone?: string;
  serviceIds?: string[];
}

export interface CreateBookingDto {
  serviceId: string;
  staffId: string;
  startTs: string;
  clientId?: string;
  client?: object;
}

export interface UpdateBookingDto {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
}

export interface CreateNotificationDto {
  bookingId: string;
  type: 'SMS' | 'EMAIL' | 'VK';
  template: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_REMINDER';
  customMessage?: string;
}

export interface CreateClientDto {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface UpdateClientDto {
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface CreateNotificationTemplateDto {
  type: 'CONFIRM' | 'REMINDER' | 'CANCEL' | 'OTHER';
  channel: 'SMS' | 'EMAIL' | 'VK';
  subject?: string;
  message: string;
  isActive?: boolean;
}

export interface UpdateNotificationTemplateDto {
  subject?: string;
  message?: string;
  isActive?: boolean;
}

