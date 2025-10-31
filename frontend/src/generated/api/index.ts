import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import * as models from './models';

export class ApiClient {
  private api: AxiosInstance;

  constructor(baseURL: string = (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_API_URL : undefined) || 'http://localhost:3001') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Добавляем токен к каждому запросу
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        (config.headers as any).Authorization = `Bearer ${token}`;
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

  async AppController_getHello(): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1`);
    return response.data;
  }

  async AppController_getHealth(): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/health`);
    return response.data;
  }

  async AuthController_vkAuth(data?: models.VkAuthDto): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/auth/vk`, data);
    return response.data;
  }

  async AuthController_login(data?: models.LoginDto): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/auth/login`, data);
    return response.data;
  }

  async AuthController_register(data?: models.CreateUserDto): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/auth/register`, data);
    return response.data;
  }

  async AuthController_getProfile(): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/auth/profile`);
    return response.data;
  }

  async BusinessController_create(data?: models.CreateBusinessDto): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/businesses`, data);
    return response.data;
  }

  async BusinessController_findAllByOwner(): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses`);
    return response.data;
  }

  async BusinessController_findOne(id: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${id}`);
    return response.data;
  }

  async BusinessController_update(id: string, data?: models.UpdateBusinessDto): Promise<any> {
    const response: AxiosResponse = await this.api.patch(`/api/v1/businesses/${id}`, data);
    return response.data;
  }

  async ServicesController_create(businessId: string, data?: models.CreateServiceDto): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/businesses/${businessId}/services`, data);
    return response.data;
  }

  async ServicesController_findAll(businessId: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/services`);
    return response.data;
  }

  async ServicesController_findOne(businessId: string, id: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/services/${id}`);
    return response.data;
  }

  async ServicesController_update(businessId: string, id: string, data?: models.UpdateServiceDto): Promise<any> {
    const response: AxiosResponse = await this.api.patch(`/api/v1/businesses/${businessId}/services/${id}`, data);
    return response.data;
  }

  async ServicesController_remove(businessId: string, id: string): Promise<any> {
    const response: AxiosResponse = await this.api.delete(`/api/v1/businesses/${businessId}/services/${id}`);
    return response.data;
  }

  async StaffController_create(businessId: string, data?: models.CreateStaffDto): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/businesses/${businessId}/staff`, data);
    return response.data;
  }

  async StaffController_findAll(businessId: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/staff`);
    return response.data;
  }

  async StaffController_findOne(businessId: string, id: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/staff/${id}`);
    return response.data;
  }

  async StaffController_update(businessId: string, id: string, data?: models.UpdateStaffDto): Promise<any> {
    const response: AxiosResponse = await this.api.patch(`/api/v1/businesses/${businessId}/staff/${id}`, data);
    return response.data;
  }

  async StaffController_remove(businessId: string, id: string): Promise<any> {
    const response: AxiosResponse = await this.api.delete(`/api/v1/businesses/${businessId}/staff/${id}`);
    return response.data;
  }

  async BookingsController_create(businessId: string, data?: models.CreateBookingDto): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/businesses/${businessId}/bookings`, data);
    return response.data;
  }

  async BookingsController_findAll(businessId: string, queryParams?: { from?: any, to?: any, staffId?: any, status?: any }): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/bookings`, { params: queryParams });
    return response.data;
  }

  async BookingsController_getAvailableSlots(businessId: string, queryParams?: { serviceId?: any, staffId?: any, date?: any }): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/bookings/available-slots`, { params: queryParams });
    return response.data;
  }

  async BookingsController_findOne(businessId: string, id: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/bookings/${id}`);
    return response.data;
  }

  async BookingsController_update(businessId: string, id: string, data?: models.UpdateBookingDto): Promise<any> {
    const response: AxiosResponse = await this.api.patch(`/api/v1/businesses/${businessId}/bookings/${id}`, data);
    return response.data;
  }

  async BookingsController_remove(businessId: string, id: string): Promise<any> {
    const response: AxiosResponse = await this.api.delete(`/api/v1/businesses/${businessId}/bookings/${id}`);
    return response.data;
  }

  async NotificationsController_create(businessId: string, data?: models.CreateNotificationDto): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/businesses/${businessId}/notifications`, data);
    return response.data;
  }

  async NotificationsController_findAll(businessId: string, queryParams?: { bookingId?: any, type?: any, status?: any }): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/notifications`, { params: queryParams });
    return response.data;
  }

  async NotificationsController_findOne(businessId: string, id: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/notifications/${id}`);
    return response.data;
  }

  async NotificationsController_resend(businessId: string, id: string): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/businesses/${businessId}/notifications/${id}/resend`);
    return response.data;
  }

  async ClientsController_create(businessId: string, data?: models.CreateClientDto): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/businesses/${businessId}/clients`, data);
    return response.data;
  }

  async ClientsController_findAll(businessId: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/clients`);
    return response.data;
  }

  async ClientsController_findOne(businessId: string, id: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/clients/${id}`);
    return response.data;
  }

  async ClientsController_update(businessId: string, id: string, data?: models.UpdateClientDto): Promise<any> {
    const response: AxiosResponse = await this.api.patch(`/api/v1/businesses/${businessId}/clients/${id}`, data);
    return response.data;
  }

  async ClientsController_remove(businessId: string, id: string): Promise<any> {
    const response: AxiosResponse = await this.api.delete(`/api/v1/businesses/${businessId}/clients/${id}`);
    return response.data;
  }

  async NotificationTemplatesController_findAll(businessId: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/notification-templates`);
    return response.data;
  }

  async NotificationTemplatesController_create(businessId: string, data?: models.CreateNotificationTemplateDto): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/businesses/${businessId}/notification-templates`, data);
    return response.data;
  }

  async NotificationTemplatesController_getAvailableVariables(businessId: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/notification-templates/variables`);
    return response.data;
  }

  async NotificationTemplatesController_findOne(businessId: string, templateId: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/notification-templates/${templateId}`);
    return response.data;
  }

  async NotificationTemplatesController_update(businessId: string, templateId: string, data?: models.UpdateNotificationTemplateDto): Promise<any> {
    const response: AxiosResponse = await this.api.patch(`/api/v1/businesses/${businessId}/notification-templates/${templateId}`, data);
    return response.data;
  }

  async NotificationTemplatesController_remove(businessId: string, templateId: string): Promise<any> {
    const response: AxiosResponse = await this.api.delete(`/api/v1/businesses/${businessId}/notification-templates/${templateId}`);
    return response.data;
  }

  async NotificationTemplatesController_processTemplate(businessId: string, templateId: string, variables?: any): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/businesses/${businessId}/notification-templates/${templateId}/process`, variables);
    return response.data;
  }

  async AvailabilityController_getAvailability(businessId: string, queryParams?: { date?: any, serviceId?: any, staffId?: any }): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/availability`, { params: queryParams });
    return response.data;
  }

  async AvailabilityController_getAvailabilityExceptions(businessId: string, queryParams?: { from?: any, to?: any }): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/api/v1/businesses/${businessId}/availability/exceptions`, { params: queryParams });
    return response.data;
  }

  async AvailabilityController_createAvailabilityException(businessId: string, data?: any): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/api/v1/businesses/${businessId}/availability/exceptions`, data);
    return response.data;
  }

  async AvailabilityController_removeAvailabilityException(businessId: string, exceptionId: string): Promise<any> {
    const response: AxiosResponse = await this.api.delete(`/api/v1/businesses/${businessId}/availability/exceptions/${exceptionId}`);
    return response.data;
  }

}

export const apiClient = new ApiClient();
