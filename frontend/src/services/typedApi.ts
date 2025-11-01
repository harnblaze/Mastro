import { apiClient } from '../generated/api';
import type { 
  CreateBusinessDto,
  UpdateBusinessDto,
  CreateServiceDto,
  UpdateServiceDto,
  CreateStaffDto,
  UpdateStaffDto,
  CreateBookingDto,
  UpdateBookingDto,
  CreateClientDto,
  UpdateClientDto,
  CreateNotificationDto,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from '../generated/api/models';

// Типизированный API сервис на основе сгенерированного клиента
export class TypedApiService {
  // Auth методы
  async vkAuth(vkToken: string) {
    return apiClient.AuthController_vkAuth({ vkToken });
  }

  async login(email: string, password: string) {
    return apiClient.AuthController_login({ email, password });
  }

  async register(email: string, password: string, vkId?: string, role?: 'OWNER' | 'STAFF') {
    return apiClient.AuthController_register({ email, password, vkId, role });
  }

  async getProfile() {
    return apiClient.AuthController_getProfile();
  }

  // Business методы
  async createBusiness(data: CreateBusinessDto) {
    return apiClient.BusinessController_create(data);
  }

  async getBusinesses() {
    return apiClient.BusinessController_findAllByOwner();
  }

  async getBusiness(id: string) {
    return apiClient.BusinessController_findOne(id);
  }

  async updateBusiness(id: string, data: UpdateBusinessDto) {
    return apiClient.BusinessController_update(id, data);
  }

  // Services методы
  async getServices(businessId: string) {
    return apiClient.ServicesController_findAll(businessId);
  }

  async createService(businessId: string, data: CreateServiceDto) {
    return apiClient.ServicesController_create(businessId, data);
  }

  async getService(businessId: string, id: string) {
    return apiClient.ServicesController_findOne(businessId, id);
  }

  async updateService(businessId: string, id: string, data: UpdateServiceDto) {
    return apiClient.ServicesController_update(businessId, id, data);
  }

  async deleteService(businessId: string, id: string) {
    return apiClient.ServicesController_remove(businessId, id);
  }

  // Staff методы
  async getStaff(businessId: string) {
    return apiClient.StaffController_findAll(businessId);
  }

  async createStaff(businessId: string, data: CreateStaffDto) {
    return apiClient.StaffController_create(businessId, data);
  }

  async getStaffMember(businessId: string, id: string) {
    return apiClient.StaffController_findOne(businessId, id);
  }

  async updateStaff(businessId: string, id: string, data: UpdateStaffDto) {
    return apiClient.StaffController_update(businessId, id, data);
  }

  async deleteStaff(businessId: string, id: string) {
    return apiClient.StaffController_remove(businessId, id);
  }

  // Bookings методы
  async getBookings(businessId: string, params?: { from?: any; to?: any; staffId?: any; status?: any }) {
    return apiClient.BookingsController_findAll(businessId, params);
  }

  async createBooking(businessId: string, data: CreateBookingDto) {
    return apiClient.BookingsController_create(businessId, data);
  }

  async getAvailableSlots(businessId: string, serviceId: string, staffId: string, date: string) {
    return apiClient.BookingsController_getAvailableSlots(businessId, { 
      serviceId, staffId, date 
    });
  }

  async getBooking(businessId: string, id: string) {
    return apiClient.BookingsController_findOne(businessId, id);
  }

  async updateBooking(businessId: string, id: string, data: UpdateBookingDto) {
    return apiClient.BookingsController_update(businessId, id, data);
  }

  async deleteBooking(businessId: string, id: string) {
    return apiClient.BookingsController_remove(businessId, id);
  }

  // Clients методы
  async getClients(businessId: string) {
    return apiClient.ClientsController_findAll(businessId);
  }

  async createClient(businessId: string, data: CreateClientDto) {
    return apiClient.ClientsController_create(businessId, data);
  }

  async getClient(businessId: string, id: string) {
    return apiClient.ClientsController_findOne(businessId, id);
  }

  async updateClient(businessId: string, id: string, data: UpdateClientDto) {
    return apiClient.ClientsController_update(businessId, id, data);
  }

  async deleteClient(businessId: string, id: string) {
    return apiClient.ClientsController_remove(businessId, id);
  }

  // Notifications методы
  async getNotifications(businessId: string, params?: { bookingId?: any; type?: any; status?: any }) {
    return apiClient.NotificationsController_findAll(businessId, params);
  }

  async createNotification(businessId: string, data: CreateNotificationDto) {
    return apiClient.NotificationsController_create(businessId, data);
  }

  async getNotification(businessId: string, id: string) {
    return apiClient.NotificationsController_findOne(businessId, id);
  }

  async resendNotification(businessId: string, id: string) {
    return apiClient.NotificationsController_resend(businessId, id);
  }

  // Availability методы
  async getAvailability(businessId: string, params: { date: string; serviceId?: string; staffId?: string }) {
    return apiClient.AvailabilityController_getAvailability(businessId, params);
  }

  async getAvailabilityExceptions(businessId: string, params?: { from?: string; to?: string }) {
    return apiClient.AvailabilityController_getAvailabilityExceptions(businessId, params);
  }

  async createAvailabilityException(businessId: string, data: any) {
    return apiClient.AvailabilityController_createAvailabilityException(businessId, data);
  }

  async deleteAvailabilityException(businessId: string, exceptionId: string) {
    return apiClient.AvailabilityController_removeAvailabilityException(businessId, exceptionId);
  }

  // Notification Templates методы
  async getNotificationTemplates(businessId: string) {
    return apiClient.NotificationTemplatesController_findAll(businessId);
  }

  async getNotificationTemplate(businessId: string, templateId: string) {
    return apiClient.NotificationTemplatesController_findOne(businessId, templateId);
  }

  async createNotificationTemplate(businessId: string, data: CreateNotificationTemplateDto) {
    return apiClient.NotificationTemplatesController_create(businessId, data);
  }

  async updateNotificationTemplate(businessId: string, templateId: string, data: UpdateNotificationTemplateDto) {
    return apiClient.NotificationTemplatesController_update(businessId, templateId, data);
  }

  async deleteNotificationTemplate(businessId: string, templateId: string) {
    return apiClient.NotificationTemplatesController_remove(businessId, templateId);
  }

  async getAvailableVariables(businessId: string) {
    return apiClient.NotificationTemplatesController_getAvailableVariables(businessId);
  }

  async processTemplate(businessId: string, templateId: string, variables: any) {
    return apiClient.NotificationTemplatesController_processTemplate(businessId, templateId, variables);
  }
}

export const typedApiService = new TypedApiService();
