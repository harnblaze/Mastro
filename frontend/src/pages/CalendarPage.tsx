import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Title, 
  Button, 
  Card as VKCard, 
  Div, 
  Text, 
  Group, 
  Header
} from '@vkontakte/vkui';
import type { Booking, Service, Staff } from '../types';
import { apiService } from '../services/api';
// import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { LoadingScreen } from '../components/LoadingScreen';
import { designSystem, commonStyles } from '../styles/designSystem';

// Стили страницы
const CALENDAR_STYLES = {
  headerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as const,
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as const,
  weekHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginBottom: '8px',
  } as const,
  weekHeaderCell: {
    padding: '8px',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    backgroundColor: 'var(--vkui--color_background_secondary)',
    borderRadius: '8px',
    color: 'var(--vkui--color_text_primary)'
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  } as const,
  dayCell: {
    border: '1px solid var(--vkui--color_border)',
    borderRadius: '8px',
    position: 'relative' as const,
    minHeight: '120px',
    padding: '8px',
  },
  dayHeader: {
    marginBottom: '4px',
  },
  bookingPill: {
    color: 'white',
    borderRadius: '4px',
    cursor: 'move',
    padding: '2px 4px',
    marginBottom: '2px',
    fontSize: '12px',
  } as const,
  moreCount: {
    fontSize: '12px',
    color: 'var(--vkui--color_text_secondary)'
  } as const
};

export const CalendarPage: React.FC = memo(() => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);

  // Форма создания записи
  const [formData, setFormData] = useState({
    serviceId: '',
    staffId: '',
    startTs: '',
    clientId: '',
    client: {
      name: '',
      phone: '',
      email: '',
    },
  });

  const loadData = useCallback(async () => {
    if (!businessId) return;

    try {
      setIsLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [bookingsData, servicesData, staffData] = await Promise.all([
        apiService.getBookings(businessId, {
          from: startOfMonth.toISOString(),
          to: endOfMonth.toISOString(),
        }),
        apiService.getServices(businessId),
        apiService.getStaff(businessId),
      ]);

      setBookings(bookingsData);
      setServices(servicesData);
      setStaff(staffData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  }, [businessId, currentDate]);

  useEffect(() => {
    if (businessId) {
      loadData();
    }
  }, [businessId, loadData]);

  const handleCreateBooking = async () => {
    try {
      const bookingData = {
        serviceId: formData.serviceId,
        staffId: formData.staffId,
        startTs: formData.startTs,
        ...(formData.clientId ? { clientId: formData.clientId } : { client: formData.client }),
      };

      await apiService.createBooking(businessId!, bookingData);
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка создания записи');
    }
  };

  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date, hour: number) => {
    e.preventDefault();

    if (!draggedBooking) return;

    const newStartTs = new Date(targetDate);
    newStartTs.setHours(hour, 0, 0, 0);

    const service = services.find(s => s.id === draggedBooking.serviceId);
    if (!service) return;

    const newEndTs = new Date(newStartTs.getTime() + service.durationMinutes * 60000);

    try {
      await apiService.updateBooking(businessId!, draggedBooking.id, {
        startTs: newStartTs.toISOString(),
        endTs: newEndTs.toISOString(),
      });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка перемещения записи');
    }

    setDraggedBooking(null);
  };

  const resetForm = () => {
    setFormData({
      serviceId: '',
      staffId: '',
      startTs: '',
      clientId: '',
      client: {
        name: '',
        phone: '',
        email: '',
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#FFA500';
      case 'CONFIRMED': return '#0077FF';
      case 'COMPLETED': return '#4CAF50';
      case 'CANCELLED': return '#F44336';
      case 'NO_SHOW': return '#9E9E9E';
      default: return '#6D7885';
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startTs);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Мемоизации
  const calendarDays = useMemo(() => generateCalendarDays(), [currentDate]);
  const handleBack = useCallback(() => navigate(`/businesses/${businessId}`), [navigate, businessId]);
  const openCreateModal = useCallback(() => setShowCreateModal(true), []);
  const closeCreateModal = useCallback(() => setShowCreateModal(false), []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div style={commonStyles.pageContainer}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: designSystem.spacing.xxl,
          textAlign: 'center',
          color: designSystem.colors.textPrimary,
        }}>
          <div style={{
            fontSize: designSystem.typography.fontSize.xxxl,
            marginBottom: designSystem.spacing.lg,
          }}>⚠️</div>
          <h2 style={designSystem.typography.h2}>Ошибка загрузки</h2>
          <p style={designSystem.typography.body}>{error}</p>
          <Button mode="primary" onClick={loadData}>
            Повторить
          </Button>
        </div>
      </div>
    );
  }

  if (!businessId) {
    return (
      <div style={commonStyles.pageContainer}>
        <Text>Не указан бизнес</Text>
      </div>
    );
  }

  return (
    <div>
      {/* Заголовок */}
      <Group>
        <Header>
          <Title level="1">Календарь записей</Title>
        </Header>
        <Div style={CALENDAR_STYLES.headerActions}>
          <div style={CALENDAR_STYLES.headerLeft}>
            <Button
              size="s"
              mode="tertiary"
              onClick={handleBack}
            >
              ← Назад
            </Button>
          </div>
          <Button size="m" mode="secondary" onClick={openCreateModal}>
            Новая запись
          </Button>
        </Div>
      </Group>

      {/* Навигация по месяцам */}
      <Group>
        <VKCard mode="outline">
          <Group>
            <Header>
              <Text weight="2">Навигация по месяцам</Text>
            </Header>
            <Div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                mode="secondary"
                size="m"
                onClick={() => navigateMonth('prev')}
              >
                ← Предыдущий месяц
              </Button>
              <Text weight="2" style={{ minWidth: '120px', textAlign: 'center' }}>
                {currentDate.toLocaleDateString('ru-RU', {
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
              <Button
                mode="secondary"
                size="m"
                onClick={() => navigateMonth('next')}
              >
                Следующий месяц →
              </Button>
            </Div>
          </Group>
        </VKCard>
      </Group>

      {/* Календарная сетка */}
      <Group>
        <VKCard mode="outline">
          <Group>
            <Header>
              <Text weight="2">Календарь записей</Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </Text>
            </Header>
            <Div>
              {/* Заголовки дней недели */}
              <div style={CALENDAR_STYLES.weekHeader}>
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                  <div key={day} style={CALENDAR_STYLES.weekHeaderCell}>
                    <Text style={{ margin: 0, fontSize: '14px' }}>{day}</Text>
                  </div>
                ))}
              </div>

              {/* Календарные дни */}
              <div style={CALENDAR_STYLES.monthGrid}>
                {calendarDays.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const dayBookings = getBookingsForDate(date);

                  return (
                    <div
                      key={index}
                      style={{
                        ...CALENDAR_STYLES.dayCell,
                        backgroundColor: isCurrentMonth ? 'var(--vkui--color_background)' : 'var(--vkui--color_background_secondary)'
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, date, 9)} // По умолчанию 9:00
                    >
                      <div style={{
                        ...CALENDAR_STYLES.dayHeader,
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: isCurrentMonth ? 'var(--vkui--color_text_primary)' : 'var(--vkui--color_text_secondary)'
                      }}>
                        <Text style={{ margin: 0 }}>{date.getDate()}</Text>
                      </div>

                      {dayBookings.slice(0, 3).map(booking => (
                        <div
                          key={booking.id}
                          style={{
                            ...CALENDAR_STYLES.bookingPill,
                            backgroundColor: getStatusColor(booking.status)
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, booking)}
                        >
                          <Text style={{ color: 'white', margin: 0, fontSize: '12px' }}>
                            {new Date(booking.startTs).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} {booking.service?.title}
                          </Text>
                        </div>
                      ))}

                      {dayBookings.length > 3 && (
                        <Text style={CALENDAR_STYLES.moreCount}>
                          +{dayBookings.length - 3} еще
                        </Text>
                      )}
                    </div>
                  );
                })}
              </div>
            </Div>
          </Group>
        </VKCard>
      </Group>

      {/* Модальное окно создания записи */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Новая запись"
        size="large"
        actions={
          <>
            <Button
              mode="secondary"
              size="m"
              onClick={closeCreateModal}
            >
              Отмена
            </Button>
            <Button
              mode="primary"
              size="m"
              onClick={handleCreateBooking}
              disabled={!formData.serviceId || !formData.staffId || !formData.startTs}
            >
              Создать запись
            </Button>
          </>
        }
      >
        <div style={{ marginBottom: designSystem.spacing.lg }}>
          <label style={{
            display: 'block',
            marginBottom: designSystem.spacing.sm,
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.textPrimary,
          }}>
            Услуга
          </label>
          <select
            value={formData.serviceId}
            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
            style={{
              width: '100%',
              padding: designSystem.spacing.md,
              border: `1px solid ${designSystem.colors.border}`,
              borderRadius: designSystem.borderRadius.md,
              fontSize: designSystem.typography.fontSize.md,
              backgroundColor: designSystem.colors.background,
              color: designSystem.colors.textPrimary,
            }}
          >
            <option value="">Выберите услугу</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title} ({service.durationMinutes} мин)
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: designSystem.spacing.lg }}>
          <label style={{
            display: 'block',
            marginBottom: designSystem.spacing.sm,
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.textPrimary,
          }}>
            Сотрудник
          </label>
          <select
            value={formData.staffId}
            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
            style={{
              width: '100%',
              padding: designSystem.spacing.md,
              border: `1px solid ${designSystem.colors.border}`,
              borderRadius: designSystem.borderRadius.md,
              fontSize: designSystem.typography.fontSize.md,
              backgroundColor: designSystem.colors.background,
              color: designSystem.colors.textPrimary,
            }}
          >
            <option value="">Выберите сотрудника</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: designSystem.spacing.lg }}>
          <label style={{
            display: 'block',
            marginBottom: designSystem.spacing.sm,
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.textPrimary,
          }}>
            Дата и время
          </label>
          <input
            type="datetime-local"
            value={formData.startTs}
            onChange={(e) => setFormData({ ...formData, startTs: e.target.value })}
            placeholder="Выберите дату и время"
            style={{
              width: '100%',
              padding: designSystem.spacing.md,
              border: `1px solid ${designSystem.colors.border}`,
              borderRadius: designSystem.borderRadius.md,
              fontSize: designSystem.typography.fontSize.md,
              backgroundColor: designSystem.colors.background,
              color: designSystem.colors.textPrimary,
            }}
          />
        </div>

        <div style={{ marginBottom: designSystem.spacing.lg }}>
          <label style={{
            display: 'block',
            marginBottom: designSystem.spacing.sm,
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.textPrimary,
          }}>
            Имя клиента
          </label>
          <input
            type="text"
            value={formData.client.name}
            onChange={(e) => setFormData({
              ...formData,
              client: { ...formData.client, name: e.target.value }
            })}
            placeholder="Введите имя"
            style={{
              width: '100%',
              padding: designSystem.spacing.md,
              border: `1px solid ${designSystem.colors.border}`,
              borderRadius: designSystem.borderRadius.md,
              fontSize: designSystem.typography.fontSize.md,
              backgroundColor: designSystem.colors.background,
              color: designSystem.colors.textPrimary,
            }}
          />
        </div>

        <div style={{ marginBottom: designSystem.spacing.lg }}>
          <label style={{
            display: 'block',
            marginBottom: designSystem.spacing.sm,
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.textPrimary,
          }}>
            Телефон
          </label>
          <input
            type="tel"
            value={formData.client.phone}
            onChange={(e) => setFormData({
              ...formData,
              client: { ...formData.client, phone: e.target.value }
            })}
            placeholder="Введите телефон"
            style={{
              width: '100%',
              padding: designSystem.spacing.md,
              border: `1px solid ${designSystem.colors.border}`,
              borderRadius: designSystem.borderRadius.md,
              fontSize: designSystem.typography.fontSize.md,
              backgroundColor: designSystem.colors.background,
              color: designSystem.colors.textPrimary,
            }}
          />
        </div>
      </Modal>
    </div>
  );
});
