import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Div, Title, Text, Button, Card, Avatar, Badge, FormItem, Select, Calendar, Group, Input } from '@vkontakte/vkui';
import { Icon24CalendarOutline, Icon24ClockOutline } from '@vkontakte/icons';
import type { Service, Staff, Business } from '../types';
import { apiService } from '../services/api';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorScreen } from '../components/ErrorScreen';
import { NotFoundScreen } from '../components/NotFoundScreen';
// Стили
const BOOKING_STYLES = {
  cardPad: { padding: '20px' } as const,
  serviceHeader: { display: 'flex', alignItems: 'center', marginBottom: '16px' } as const,
  avatar: { marginRight: '12px' } as const,
  badgesRow: { display: 'flex', gap: '12px', marginBottom: '16px' } as const,
  gridTimes: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' } as const,
  notesArea: {
    width: '100%', padding: '12px', border: '1px solid var(--vkui--color_border)', borderRadius: '8px',
    fontSize: '16px', resize: 'vertical' as const, backgroundColor: 'var(--vkui--color_background)', color: 'var(--vkui--color_text_primary)'
  } as const,
} as const;

interface TimeSlot {
  time: string;
  available: boolean;
  staffId: string;
  staffName: string;
}

export const BookingPage: React.FC = memo(() => {
  const { businessId, serviceId } = useParams<{ businessId: string; serviceId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Состояние формы
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  
  // Данные клиента
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [businessData, serviceData, staffData] = await Promise.all([
        apiService.getBusiness(businessId!),
        apiService.getService(businessId!, serviceId!),
        apiService.getStaff(businessId!),
      ]);

      setBusiness(businessData);
      setService(serviceData);
      setStaff(staffData);
      
      if (staffData.length === 1) {
        setSelectedStaffId(staffData[0].id);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка загрузки данных'
        : 'Ошибка загрузки данных';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, serviceId]);

  const loadAvailableSlots = useCallback(async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const slots = await apiService.getAvailableSlots(
        businessId!,
        serviceId!,
        selectedStaffId,
        dateStr
      );
      
      const staffName = staff.find(s => s.id === selectedStaffId)?.name || '';
      const timeSlots: TimeSlot[] = slots.map((slot: string) => ({
        time: new Date(slot).toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        available: true,
        staffId: selectedStaffId,
        staffName,
      }));
      
      setAvailableSlots(timeSlots);
    } catch (err: unknown) {
      setAvailableSlots([]);
    }
  }, [businessId, serviceId, selectedStaffId, selectedDate, staff]);

  useEffect(() => {
    if (businessId && serviceId) {
      loadData();
    }
  }, [businessId, serviceId, loadData]);

  useEffect(() => {
    if (selectedDate && selectedStaffId) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedStaffId, loadAvailableSlots]);

  const handleCreateBooking = useCallback(async () => {
    if (!selectedSlot || !clientData.name || !clientData.phone) {
      setError('Заполните все обязательные поля');
      return;
    }

    try {
      setIsCreatingBooking(true);
      
      const [hours, minutes] = selectedSlot.split(':');
      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const bookingData = {
        serviceId: serviceId!,
        staffId: selectedStaffId,
        startTs: bookingDate.toISOString(),
        client: {
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email || undefined,
        },
      };

      const booking = await apiService.createBooking(businessId!, bookingData);
      navigate(`/business/${businessId}/booking/${booking.id}/success`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка создания записи'
        : 'Ошибка создания записи';
      setError(errorMessage);
    } finally {
      setIsCreatingBooking(false);
    }
  }, [businessId, serviceId, selectedStaffId, selectedDate, selectedSlot, clientData, navigate]);

  const formatPrice = useCallback((price: number) => `${price.toLocaleString('ru-RU')} ₽`, []);

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
    }
    return `${mins}м`;
  }, []);

  const formattedDate = useMemo(() => selectedDate.toLocaleDateString('ru-RU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }), [selectedDate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error && !isCreatingBooking) {
    return (
      <ErrorScreen
        message={error}
        onRetry={() => navigate(`/business/${businessId}`)}
        retryButtonText="Назад"
      />
    );
  }

  if (!business || !service) {
    return (
      <NotFoundScreen
        title="Данные не найдены"
        message="Возможно, услуга была удалена или произошла ошибка"
        buttonText="Вернуться к услугам"
        onAction={() => navigate(`/business/${businessId}`)}
      />
    );
  }

  return (
    <div>
      {/* Информация об услуге */}
      <Group>
        <Card mode="outline" style={{ marginBottom: '16px' }}>
          <Div style={BOOKING_STYLES.cardPad}>
            <div style={BOOKING_STYLES.serviceHeader}>
              <Avatar
                size={60}
                src={business.photo || undefined}
                style={BOOKING_STYLES.avatar}
              />
              <div style={{ flex: 1 }}>
                <Text weight="2" style={{ marginBottom: '4px' }}>
                  {business.name}
                </Text>
                <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                  {service.title}
                </Text>
              </div>
            </div>
            
            <div style={BOOKING_STYLES.badgesRow}>
              <Badge>
                <Icon24ClockOutline style={{ marginRight: '4px' }} />
                {formatDuration(service.durationMinutes)}
              </Badge>
              <Badge>
                {formatPrice(service.price)}
              </Badge>
            </div>
          </Div>
        </Card>
      </Group>

      {/* Выбор мастера */}
      <Group>
        <Card mode="outline" style={{ marginBottom: '16px' }}>
          <Div style={BOOKING_STYLES.cardPad}>
            <Title level="2" style={{ marginBottom: '16px' }}>
              Выберите мастера
            </Title>
            
            <FormItem>
              <Select
                placeholder="Выберите мастера"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                options={staff.map((member) => ({
                  label: member.name,
                  value: member.id,
                }))}
              />
            </FormItem>
          </Div>
        </Card>
      </Group>

      {/* Выбор даты */}
      {selectedStaffId && (
        <Group>
          <Card mode="outline" style={{ marginBottom: '16px' }}>
            <Div style={BOOKING_STYLES.cardPad}>
              <Title level="2" style={{ marginBottom: '16px' }}>
                Выберите дату
              </Title>
              
              <Calendar
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
              />
            </Div>
          </Card>
        </Group>
      )}

      {/* Выбор времени */}
      {selectedStaffId && availableSlots.length > 0 && (
        <Group>
          <Card mode="outline" style={{ marginBottom: '16px' }}>
            <Div style={BOOKING_STYLES.cardPad}>
              <Title level="2" style={{ marginBottom: '16px' }}>
                Доступное время на {formattedDate}
              </Title>
              
              <div style={BOOKING_STYLES.gridTimes}>
                {availableSlots.map((slot) => (
                  <Button
                    key={`${slot.time}-${slot.staffId}`}
                    size="s"
                    mode={selectedSlot === slot.time ? 'primary' : 'secondary'}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.time)}
                    style={{ opacity: slot.available ? 1 : 0.5 }}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            </Div>
          </Card>
        </Group>
      )}

      {/* Форма клиента */}
      {selectedSlot && (
        <Group>
          <Card mode="outline" style={{ marginBottom: '16px' }}>
            <Div style={BOOKING_STYLES.cardPad}>
              <Title level="2" style={{ marginBottom: '16px' }}>
                Ваши данные
              </Title>
              
              <FormItem top="Имя *">
                <Input
                  type="text"
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  placeholder="Введите ваше имя"
                />
              </FormItem>
              
              <FormItem top="Телефон *">
                <Input
                  type="tel"
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  placeholder="+7 (999) 123-45-67"
                />
              </FormItem>
              
              <FormItem top="Email">
                <Input
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </FormItem>
              
              <FormItem top="Комментарий">
                <textarea
                  value={clientData.notes}
                  onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
                  placeholder="Дополнительные пожелания..."
                  rows={3}
                  style={BOOKING_STYLES.notesArea}
                />
              </FormItem>
            </Div>
          </Card>
        </Group>
      )}

      {/* Кнопка записи */}
      {selectedSlot && clientData.name && clientData.phone && (
        <Group>
          <Card mode="outline">
            <Div style={BOOKING_STYLES.cardPad}>
              <Button
                size="l"
                mode="primary"
                stretched
                loading={isCreatingBooking}
                onClick={handleCreateBooking}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon24CalendarOutline style={{ marginRight: '8px' }} />
                Записаться на {selectedSlot}
              </Button>
            </Div>
          </Card>
        </Group>
      )}
    </div>
  );
});
