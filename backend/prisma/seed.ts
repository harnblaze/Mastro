import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем инициализацию базы данных...');

  // Создаем тестового пользователя
  const passwordHash = await bcrypt.hash('password', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: passwordHash,
      role: 'OWNER',
    },
  });

  console.log('✅ Пользователь создан:', user.email);

  // Создаем тестовый бизнес
  const business = await prisma.business.upsert({
    where: { id: 'test-business-1' },
    update: {},
    create: {
      id: 'test-business-1',
      ownerId: user.id,
      name: 'Салон красоты "Элегант"',
      address: 'ул. Тверская, 15, Москва',
      timezone: 'Europe/Moscow',
      phone: '+7 (495) 123-45-67',
      email: 'info@elegant-salon.ru',
      description: 'Профессиональные услуги красоты и ухода',
      workingHours: {
        monday: { isWorking: true, start: '09:00', end: '21:00' },
        tuesday: { isWorking: true, start: '09:00', end: '21:00' },
        wednesday: { isWorking: true, start: '09:00', end: '21:00' },
        thursday: { isWorking: true, start: '09:00', end: '21:00' },
        friday: { isWorking: true, start: '09:00', end: '21:00' },
        saturday: { isWorking: true, start: '10:00', end: '20:00' },
        sunday: { isWorking: false, start: '10:00', end: '18:00' },
      },
    },
  });

  console.log('✅ Бизнес создан:', business.name);

  // Создаем услуги
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'service-manicure' },
      update: {},
      create: {
        id: 'service-manicure',
        businessId: business.id,
        title: 'Маникюр классический',
        durationMinutes: 60,
        price: 200000, // 2000 рублей в копейках
        bufferBefore: 10,
        bufferAfter: 10,
        color: '#FF6B9D',
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-pedicure' },
      update: {},
      create: {
        id: 'service-pedicure',
        businessId: business.id,
        title: 'Педикюр классический',
        durationMinutes: 90,
        price: 300000, // 3000 рублей в копейках
        bufferBefore: 10,
        bufferAfter: 10,
        color: '#4ECDC4',
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-haircut' },
      update: {},
      create: {
        id: 'service-haircut',
        businessId: business.id,
        title: 'Стрижка женская',
        durationMinutes: 45,
        price: 250000, // 2500 рублей в копейках
        bufferBefore: 5,
        bufferAfter: 5,
        color: '#45B7D1',
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-coloring' },
      update: {},
      create: {
        id: 'service-coloring',
        businessId: business.id,
        title: 'Окрашивание волос',
        durationMinutes: 120,
        price: 500000, // 5000 рублей в копейках
        bufferBefore: 15,
        bufferAfter: 15,
        color: '#96CEB4',
      },
    }),
  ]);

  console.log('✅ Услуги созданы:', services.length);

  // Создаем сотрудников
  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { id: 'staff-anna' },
      update: {},
      create: {
        id: 'staff-anna',
        businessId: business.id,
        name: 'Анна Петрова',
        phone: '+7 (495) 111-11-11',
      },
    }),
    prisma.staff.upsert({
      where: { id: 'staff-maria' },
      update: {},
      create: {
        id: 'staff-maria',
        businessId: business.id,
        name: 'Мария Иванова',
        phone: '+7 (495) 222-22-22',
      },
    }),
  ]);

  console.log('✅ Сотрудники созданы:', staff.length);

  // Связываем сотрудников с услугами
  await Promise.all([
    // Анна - маникюр и педикюр
    prisma.staffService.upsert({
      where: {
        staffId_serviceId: { staffId: staff[0].id, serviceId: services[0].id },
      },
      update: {},
      create: {
        staffId: staff[0].id,
        serviceId: services[0].id,
      },
    }),
    prisma.staffService.upsert({
      where: {
        staffId_serviceId: { staffId: staff[0].id, serviceId: services[1].id },
      },
      update: {},
      create: {
        staffId: staff[0].id,
        serviceId: services[1].id,
      },
    }),
    // Мария - стрижка и окрашивание
    prisma.staffService.upsert({
      where: {
        staffId_serviceId: { staffId: staff[1].id, serviceId: services[2].id },
      },
      update: {},
      create: {
        staffId: staff[1].id,
        serviceId: services[2].id,
      },
    }),
    prisma.staffService.upsert({
      where: {
        staffId_serviceId: { staffId: staff[1].id, serviceId: services[3].id },
      },
      update: {},
      create: {
        staffId: staff[1].id,
        serviceId: services[3].id,
      },
    }),
  ]);

  console.log('✅ Связи сотрудников и услуг созданы');

  // Создаем тестовых клиентов
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: 'client-elena' },
      update: {},
      create: {
        id: 'client-elena',
        businessId: business.id,
        name: 'Елена Смирнова',
        phone: '+7 (495) 333-33-33',
        email: 'elena@example.com',
        notes: 'Постоянный клиент, предпочитает классический маникюр',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-olga' },
      update: {},
      create: {
        id: 'client-olga',
        businessId: business.id,
        name: 'Ольга Козлова',
        phone: '+7 (495) 444-44-44',
        email: 'olga@example.com',
        notes: 'Любит экспериментировать с цветами',
      },
    }),
  ]);

  console.log('✅ Клиенты созданы:', clients.length);

  // Создаем тестовые записи
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(14, 0, 0, 0);

  const bookings = await Promise.all([
    prisma.booking.upsert({
      where: { id: 'booking-1' },
      update: {},
      create: {
        id: 'booking-1',
        businessId: business.id,
        serviceId: services[0].id, // Маникюр
        staffId: staff[0].id, // Анна
        clientId: clients[0].id, // Елена
        startTs: tomorrow,
        endTs: new Date(tomorrow.getTime() + 80 * 60000), // 60 мин + 20 мин буфер
        status: 'CONFIRMED',
        source: 'WEB',
      },
    }),
    prisma.booking.upsert({
      where: { id: 'booking-2' },
      update: {},
      create: {
        id: 'booking-2',
        businessId: business.id,
        serviceId: services[2].id, // Стрижка
        staffId: staff[1].id, // Мария
        clientId: clients[1].id, // Ольга
        startTs: dayAfterTomorrow,
        endTs: new Date(dayAfterTomorrow.getTime() + 55 * 60000), // 45 мин + 10 мин буфер
        status: 'PENDING',
        source: 'VK',
      },
    }),
  ]);

  console.log('✅ Записи созданы:', bookings.length);

  // Создаем шаблоны уведомлений
  const templates = await Promise.all([
    prisma.notificationTemplate.upsert({
      where: {
        businessId_type_channel: {
          businessId: business.id,
          type: 'CONFIRM',
          channel: 'SMS',
        },
      },
      update: {},
      create: {
        businessId: business.id,
        type: 'CONFIRM',
        channel: 'SMS',
        subject: 'Подтверждение записи',
        message:
          'Привет, {{clientName}}! Ваша запись в {{businessName}} подтверждена: {{serviceName}} с {{staffName}} на {{date}} в {{time}}. Ждем вас!',
        isActive: true,
      },
    }),
    prisma.notificationTemplate.upsert({
      where: {
        businessId_type_channel: {
          businessId: business.id,
          type: 'REMINDER',
          channel: 'SMS',
        },
      },
      update: {},
      create: {
        businessId: business.id,
        type: 'REMINDER',
        channel: 'SMS',
        subject: 'Напоминание о записи',
        message:
          'Привет, {{clientName}}! Напоминаем о записи в {{businessName}}: {{serviceName}} с {{staffName}} завтра в {{time}}. До встречи!',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Шаблоны уведомлений созданы:', templates.length);

  console.log('🎉 Инициализация базы данных завершена успешно!');
  console.log('\n📋 Созданные данные:');
  console.log(`👤 Пользователь: ${user.email}`);
  console.log(`🏢 Бизнес: ${business.name}`);
  console.log(`💅 Услуги: ${services.length}`);
  console.log(`👥 Сотрудники: ${staff.length}`);
  console.log(`👤 Клиенты: ${clients.length}`);
  console.log(`📅 Записи: ${bookings.length}`);
  console.log(`📝 Шаблоны: ${templates.length}`);
  console.log('\n🔑 Для входа используйте:');
  console.log('Email: test@example.com');
  console.log('Пароль: password');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при инициализации:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
