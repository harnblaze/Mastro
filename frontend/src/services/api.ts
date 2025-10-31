import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  AuthResponse, 
  Business, 
  Service, 
  Staff, 
  Booking, 
  Client,
  Notification,
  User 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3001/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Добавляем токен к каждому запросу
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Обработка ошибок
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async vkAuth(vkToken: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/vk', {
      vkToken,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', {
      email,
      password,
    });
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/profile');
    return response.data;
  }

  // Business
  async getBusinesses(): Promise<Business[]> {
    const response: AxiosResponse<Business[]> = await this.api.get('/businesses');
    return response.data;
  }

  async getBusiness(id: string): Promise<Business> {
    const response: AxiosResponse<Business> = await this.api.get(`/businesses/${id}`);
    return response.data;
  }

  async createBusiness(data: Partial<Business>): Promise<Business> {
    const response: AxiosResponse<Business> = await this.api.post('/businesses', data);
    return response.data;
  }

  async updateBusiness(id: string, data: Partial<Business>): Promise<Business> {
    const response: AxiosResponse<Business> = await this.api.patch(`/businesses/${id}`, data);
    return response.data;
  }

  // Services
  async getServices(businessId: string): Promise<Service[]> {
    const response: AxiosResponse<Service[]> = await this.api.get(`/businesses/${businessId}/services`);
    return response.data;
  }

  async createService(businessId: string, data: Partial<Service>): Promise<Service> {
    const response: AxiosResponse<Service> = await this.api.post(`/businesses/${businessId}/services`, data);
    return response.data;
  }

  async updateService(businessId: string, id: string, data: Partial<Service>): Promise<Service> {
    const response: AxiosResponse<Service> = await this.api.patch(`/businesses/${businessId}/services/${id}`, data);
    return response.data;
  }

  async deleteService(businessId: string, id: string): Promise<void> {
    await this.api.delete(`/businesses/${businessId}/services/${id}`);
  }

  async getService(businessId: string, id: string): Promise<Service> {
    const response: AxiosResponse<Service> = await this.api.get(`/businesses/${businessId}/services/${id}`);
    return response.data;
  }

  // Staff
  async getStaff(businessId: string): Promise<Staff[]> {
    const response: AxiosResponse<Staff[]> = await this.api.get(`/businesses/${businessId}/staff`);
    return response.data;
  }

  async createStaff(businessId: string, data: Partial<Staff>): Promise<Staff> {
    const response: AxiosResponse<Staff> = await this.api.post(`/businesses/${businessId}/staff`, data);
    return response.data;
  }

  async updateStaff(businessId: string, id: string, data: Partial<Staff>): Promise<Staff> {
    const response: AxiosResponse<Staff> = await this.api.patch(`/businesses/${businessId}/staff/${id}`, data);
    return response.data;
  }

  async deleteStaff(businessId: string, id: string): Promise<void> {
    await this.api.delete(`/businesses/${businessId}/staff/${id}`);
  }

  async getStaffMember(businessId: string, id: string): Promise<Staff> {
    const response: AxiosResponse<Staff> = await this.api.get(`/businesses/${businessId}/staff/${id}`);
    return response.data;
  }

  // Bookings
  async getBookings(businessId: string, params?: any): Promise<Booking[]> {
    const response: AxiosResponse<Booking[]> = await this.api.get(`/businesses/${businessId}/bookings`, { params });
    return response.data;
  }

  async createBooking(businessId: string, data: any): Promise<Booking> {
    const response: AxiosResponse<Booking> = await this.api.post(`/businesses/${businessId}/bookings`, data);
    return response.data;
  }

  async updateBooking(businessId: string, id: string, data: any): Promise<Booking> {
    const response: AxiosResponse<Booking> = await this.api.patch(`/businesses/${businessId}/bookings/${id}`, data);
    return response.data;
  }

  async deleteBooking(businessId: string, id: string): Promise<void> {
    await this.api.delete(`/businesses/${businessId}/bookings/${id}`);
  }

  async getAvailableSlots(businessId: string, serviceId: string, staffId: string, date: string): Promise<string[]> {
    const response: AxiosResponse<string[]> = await this.api.get(`/businesses/${businessId}/bookings/available-slots`, {
      params: { serviceId, staffId, date },
    });
    return response.data;
  }

  async getBooking(businessId: string, id: string): Promise<Booking> {
    const response: AxiosResponse<Booking> = await this.api.get(`/businesses/${businessId}/bookings/${id}`);
    return response.data;
  }

  // Clients
  async getClients(businessId: string): Promise<Client[]> {
    const response: AxiosResponse<Client[]> = await this.api.get(`/businesses/${businessId}/clients`);
    return response.data;
  }

  async createClient(businessId: string, data: Partial<Client>): Promise<Client> {
    const response: AxiosResponse<Client> = await this.api.post(`/businesses/${businessId}/clients`, data);
    return response.data;
  }

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    const response: AxiosResponse<Client> = await this.api.patch(`/clients/${id}`, data);
    return response.data;
  }

  async deleteClient(id: string): Promise<void> {
    await this.api.delete(`/clients/${id}`);
  }

  // Notifications
  async getNotifications(businessId: string, params?: any): Promise<Notification[]> {
    const response: AxiosResponse<Notification[]> = await this.api.get(`/businesses/${businessId}/notifications`, { params });
    return response.data;
  }

  async createNotification(businessId: string, data: any): Promise<Notification> {
    const response: AxiosResponse<Notification> = await this.api.post(`/businesses/${businessId}/notifications`, data);
    return response.data;
  }

  async resendNotification(id: string): Promise<void> {
    await this.api.post(`/notifications/${id}/resend`);
  }

  // Availability
  async getAvailability(
    businessId: string,
    params: {
      date: string;
      serviceId?: string;
      staffId?: string;
    },
  ): Promise<any> {
    const response = await this.api.get(`/businesses/${businessId}/availability`, { params });
    return response.data;
  }

  async getAvailabilityExceptions(
    businessId: string,
    params?: {
      from?: string;
      to?: string;
    },
  ): Promise<any[]> {
    const response = await this.api.get(`/businesses/${businessId}/availability/exceptions`, { params });
    return response.data;
  }

  async createAvailabilityException(
    businessId: string,
    data: {
      date: string;
      startTime?: string;
      endTime?: string;
      type: 'CLOSED' | 'OPEN_CUSTOM';
      reason?: string;
    },
  ): Promise<any> {
    const response = await this.api.post(`/businesses/${businessId}/availability/exceptions`, data);
    return response.data;
  }

  async deleteAvailabilityException(exceptionId: string): Promise<void> {
    await this.api.delete(`/availability/exceptions/${exceptionId}`);
  }

  // Notification Templates
  async getNotificationTemplates(businessId: string): Promise<any[]> {
    const response = await this.api.get(`/businesses/${businessId}/notification-templates`);
    return response.data;
  }

  async getNotificationTemplate(businessId: string, templateId: string): Promise<any> {
    const response = await this.api.get(`/businesses/${businessId}/notification-templates/${templateId}`);
    return response.data;
  }

  async createNotificationTemplate(
    businessId: string,
    data: {
      type: 'CONFIRM' | 'REMINDER' | 'CANCEL' | 'OTHER';
      channel: 'SMS' | 'EMAIL' | 'VK';
      subject?: string;
      message: string;
      isActive?: boolean;
    },
  ): Promise<any> {
    const response = await this.api.post(`/businesses/${businessId}/notification-templates`, data);
    return response.data;
  }

  async updateNotificationTemplate(
    businessId: string,
    templateId: string,
    data: {
      subject?: string;
      message?: string;
      isActive?: boolean;
    },
  ): Promise<any> {
    const response = await this.api.patch(`/businesses/${businessId}/notification-templates/${templateId}`, data);
    return response.data;
  }

  async deleteNotificationTemplate(businessId: string, templateId: string): Promise<void> {
    await this.api.delete(`/businesses/${businessId}/notification-templates/${templateId}`);
  }

  async getAvailableVariables(businessId: string): Promise<{ [key: string]: string }> {
    const response = await this.api.get(`/businesses/${businessId}/notification-templates/variables`);
    return response.data;
  }

  async processTemplate(
    businessId: string,
    templateId: string,
    variables: { [key: string]: string },
  ): Promise<{ subject?: string; message: string }> {
    const response = await this.api.post(`/businesses/${businessId}/notification-templates/${templateId}/process`, variables);
    return response.data;
  }
}

export const apiService = new ApiService()

// Экспортируем класс для тестирования
export { ApiService }
