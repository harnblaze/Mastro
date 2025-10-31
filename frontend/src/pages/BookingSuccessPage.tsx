import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Div,
  Title,
  Text,
  Button,
  Card,
  Avatar,
  Badge,
  Separator,
  Group
} from '@vkontakte/vkui';
import { Icon24CheckCircleOutline, Icon24CalendarOutline, Icon24PhoneOutline, Icon24UserOutline } from '@vkontakte/icons';
import type { Booking, Business, Service, Staff } from '../types';
import { apiService } from '../services/api';
import { LoadingScreen } from '../components/LoadingScreen';

// Стили
const SUCCESS_STYLES = {
  successCard: { marginBottom: '16px', textAlign: 'center' } as const,
  successInner: { padding: '40px 20px' } as const,
  successIcon: { fontSize: '64px', color: 'var(--vkui--color_accent_green)', marginBottom: '16px' } as const,
  cardPad: { padding: '20px' } as const,
  headerRow: { display: 'flex', alignItems: 'center', marginBottom: '16px' } as const,
  avatar: { marginRight: '12px' } as const,
  detailsCol: { display: 'flex', flexDirection: 'column', gap: '12px' } as const,
  actionsCol: { display: 'flex', flexDirection: 'column', gap: '12px' } as const,
} as const;

export const BookingSuccessPage: React.FC = memo(() => {
  const { businessId, bookingId } = useParams<{ businessId: string; bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookingData = useCallback(async () => {
    try {
      setIsLoading(true);
      const bookingData = await apiService.getBooking(businessId!, bookingId!);
      setBooking(bookingData);
      const [businessData, serviceData, staffData] = await Promise.all([
        apiService.getBusiness(businessId!),
        apiService.getService(businessId!, bookingData.serviceId),
        apiService.getStaffMember(businessId!, bookingData.staffId),
      ]);
      setBusiness(businessData);
      setService(serviceData);
      setStaff(staffData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка загрузки данных записи'
        : 'Ошибка загрузки данных записи';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, bookingId]);

  useEffect(() => {
    if (bookingId) {
      loadBookingData();
    }
  }, [bookingId, loadBookingData]);

  const formatPrice = useCallback((price: number) => `${price.toLocaleString('ru-RU')} ₽`, []);

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
    }
    return `${mins}м`;
  }, []);

  const formatDateTime = useCallback((dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    const statusConfig = {
      PENDING: { mode: undefined, text: 'Ожидает подтверждения' },
      CONFIRMED: { mode: 'prominent' as const, text: 'Подтверждена' },
      CANCELLED: { mode: undefined, text: 'Отменена' },
      COMPLETED: { mode: undefined, text: 'Завершена' },
      NO_SHOW: { mode: undefined, text: 'Не явился' },
    } as const;
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  }, []);

  const handleAddToCalendar = useCallback(() => {
    if (!booking || !service || !staff) return;
    const startDate = new Date(booking.startTs);
    const endDate = new Date(booking.endTs);
    const title = `${service.title} - ${business?.name}`;
    const description = `Мастер: ${staff.name}\nЦена: ${formatPrice(service.price)}`;
    const location = business?.address || '';
    const toIcs = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0];
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${toIcs(startDate)}/${toIcs(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    window.open(googleCalendarUrl, '_blank');
  }, [booking, service, staff, business, formatPrice]);

  const handleShare = useCallback(() => {
    if (!booking || !service) return;
    const shareText = `Я записался на ${service.title} на ${formatDateTime(booking.startTs)}`;
    if (navigator.share) {
      navigator.share({
        title: `Запись в ${business?.name}`,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  }, [booking, service, business, formatDateTime]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div>
        <Group>
          <Div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
            color: 'var(--vkui--color_text_primary)',
          }}>
            <Text weight="2" style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</Text>
            <Text weight="2" style={{ fontSize: '20px', marginBottom: '8px' }}>Ошибка загрузки</Text>
            <Text style={{ marginBottom: '24px' }}>{error}</Text>
            <Button size="m" mode="primary" onClick={() => navigate(`/business/${businessId}`)}>
              Назад к салону
            </Button>
          </Div>
        </Group>
      </div>
    );
  }

  if (!booking || !business || !service || !staff) {
    return (
      <div>
        <Group>
          <Div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
            color: 'var(--vkui--color_text_primary)',
          }}>
            <Text weight="2" style={{ fontSize: '48px', marginBottom: '16px' }}>❌</Text>
            <Text weight="2" style={{ fontSize: '20px', marginBottom: '8px' }}>Данные записи не найдены</Text>
            <Text style={{ marginBottom: '24px', color: 'var(--vkui--color_text_secondary)' }}>
              Возможно, запись была удалена или произошла ошибка
            </Text>
            <Button size="m" mode="primary" onClick={() => navigate(`/business/${businessId}`)}>
              Вернуться к услугам
            </Button>
          </Div>
        </Group>
      </div>
    );
  }

  const statusConfig = getStatusBadge(booking.status);

  return (
    <div>
      {/* Заголовок успеха */}
      <Group>
        <Card mode="outline" style={SUCCESS_STYLES.successCard}>
          <Div style={SUCCESS_STYLES.successInner}>
            <Icon24CheckCircleOutline style={SUCCESS_STYLES.successIcon} />
            <Title level="1" style={{ marginBottom: '8px' }}>
              Запись создана!
            </Title>
            <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
              Мы свяжемся с вами для подтверждения
            </Text>
          </Div>
        </Card>
      </Group>

      {/* Информация о записи */}
      <Group>
        <Card mode="outline" style={{ marginBottom: '16px' }}>
          <Div style={SUCCESS_STYLES.cardPad}>
            <Title level="2" style={{ marginBottom: '16px' }}>
              Детали записи
            </Title>
            
            <div style={SUCCESS_STYLES.headerRow}>
              <Avatar
                size={60}
                src={business.photo || undefined}
                style={SUCCESS_STYLES.avatar}
              />
              <div style={{ flex: 1 }}>
                <Text weight="2" style={{ marginBottom: '4px' }}>
                  {business.name}
                </Text>
                <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                  {service.title}
                </Text>
              </div>
              <Badge mode={statusConfig.mode}>
                {statusConfig.text}
              </Badge>
            </div>

            <Separator style={{ margin: '16px 0' }} />

            <div style={SUCCESS_STYLES.detailsCol}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon24CalendarOutline style={{ marginRight: '8px', color: 'var(--vkui--color_text_secondary)' }} />
                <Text>{formatDateTime(booking.startTs)}</Text>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon24UserOutline style={{ marginRight: '8px', color: 'var(--vkui--color_text_secondary)' }} />
                <Text>Мастер: {staff.name}</Text>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon24PhoneOutline style={{ marginRight: '8px', color: 'var(--vkui--color_text_secondary)' }} />
                <Text>Телефон: {business.phone}</Text>
              </div>
            </div>

            <Separator style={{ margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text weight="2">Длительность:</Text>
                <Text style={{ marginLeft: '8px' }}>{formatDuration(service.durationMinutes)}</Text>
              </div>
              <div>
                <Text weight="2">Стоимость:</Text>
                <Text style={{ marginLeft: '8px', color: 'var(--vkui--color_accent_green)' }}>
                  {formatPrice(service.price)}
                </Text>
              </div>
            </div>
          </Div>
        </Card>
      </Group>

      {/* Действия */}
      <Group>
        <Card mode="outline" style={{ marginBottom: '16px' }}>
          <Div style={SUCCESS_STYLES.cardPad}>
            <div style={SUCCESS_STYLES.actionsCol}>
              <Button
                size="l"
                mode="primary"
                stretched
                onClick={handleAddToCalendar}
              >
                <Icon24CalendarOutline style={{ marginRight: '8px' }} />
                Добавить в календарь
              </Button>
              
              <Button
                size="l"
                mode="secondary"
                stretched
                onClick={handleShare}
              >
                Поделиться записью
              </Button>
            </div>
          </Div>
        </Card>
      </Group>

      {/* Дополнительная информация */}
      <Group>
        <Card mode="outline">
          <Div style={SUCCESS_STYLES.cardPad}>
            <Title level="3" style={{ marginBottom: '12px' }}>
              Что дальше?
            </Title>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Text style={{ fontSize: '14px', color: 'var(--vkui--color_text_secondary)' }}>
                • Мы свяжемся с вами для подтверждения записи
              </Text>
              <Text style={{ fontSize: '14px', color: 'var(--vkui--color_text_secondary)' }}>
                • За день до визита вы получите напоминание
              </Text>
              <Text style={{ fontSize: '14px', color: 'var(--vkui--color_text_secondary)' }}>
                • При необходимости вы можете отменить запись
              </Text>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <Button
                size="m"
                mode="tertiary"
                onClick={() => navigate(`/business/${businessId}`)}
              >
                Вернуться к услугам
              </Button>
            </div>
          </Div>
        </Card>
      </Group>
    </div>
  );
});
