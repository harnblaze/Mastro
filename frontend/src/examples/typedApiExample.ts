// Пример использования типизированного API
import { typedApiService } from '../services/typedApi';
import type { 
  CreateServiceDto, 
  CreateStaffDto, 
  CreateBookingDto,
  CreateClientDto 
} from '../generated/api/models';

// Пример создания услуги с полной типизацией
const createService = async () => {
  const serviceData: CreateServiceDto = {
    title: 'Стрижка',
    durationMinutes: 60,
    price: 1500,
    bufferBefore: 10,
    bufferAfter: 10,
    color: '#FF5733'
  };

  try {
    const service = await typedApiService.createService('business-id', serviceData);
    console.log('Услуга создана:', service);
    return service;
  } catch (error) {
    console.error('Ошибка создания услуги:', error);
  }
};

// Пример создания сотрудника
const createStaff = async () => {
  const staffData: CreateStaffDto = {
    name: 'Анна Иванова',
    phone: '+7 (999) 123-45-67',
    serviceIds: ['service-id-1', 'service-id-2']
  };

  try {
    const staff = await typedApiService.createStaff('business-id', staffData);
    console.log('Сотрудник создан:', staff);
    return staff;
  } catch (error) {
    console.error('Ошибка создания сотрудника:', error);
  }
};

// Пример создания клиента
const createClient = async () => {
  const clientData: CreateClientDto = {
    name: 'Иван Петров',
    phone: '+7 (999) 987-65-43',
    email: 'ivan@example.com',
    notes: 'Предпочитает утренние записи'
  };

  try {
    const client = await typedApiService.createClient('business-id', clientData);
    console.log('Клиент создан:', client);
    return client;
  } catch (error) {
    console.error('Ошибка создания клиента:', error);
  }
};

// Пример создания записи
const createBooking = async () => {
  const bookingData: CreateBookingDto = {
    serviceId: 'service-id',
    staffId: 'staff-id',
    startTs: '2024-01-15T10:00:00Z',
    clientId: 'client-id',
    client: {
      name: 'Новый клиент',
      phone: '+7 (999) 111-22-33',
      email: 'new@example.com'
    }
  };

  try {
    const booking = await typedApiService.createBooking('business-id', bookingData);
    console.log('Запись создана:', booking);
    return booking;
  } catch (error) {
    console.error('Ошибка создания записи:', error);
  }
};

// Пример получения доступных слотов
const getAvailableSlots = async () => {
  try {
    const slots = await typedApiService.getAvailableSlots(
      'business-id',
      'service-id',
      'staff-id',
      '2024-01-15'
    );
    console.log('Доступные слоты:', slots);
    return slots;
  } catch (error) {
    console.error('Ошибка получения слотов:', error);
  }
};

export {
  createService,
  createStaff,
  createClient,
  createBooking,
  getAvailableSlots
};
