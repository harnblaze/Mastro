import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Text,
  Alert,
  Title,
  Button,
  Group,
  Header,
  Div,
  Card as VKCard,
  Badge
} from '@vkontakte/vkui';
import type { Booking, Business } from '../types';
import { apiService } from '../services/api';
import { StatCard } from '../components/StatCard';
import { LoadingScreen } from '../components/LoadingScreen';
import { useMobile } from '../hooks/useMobile';

// Константы для стилей
const DASHBOARD_STYLES = {
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
  statusesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px',
  } as const,
  statusBadgeContainer: {
    textAlign: 'center' as const,
  },
  statusBadge: {
    fontSize: '24px',
    fontWeight: 'bold',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: '8px',
    color: 'white',
  } as const,
  statusText: {
    fontSize: '14px',
    color: 'var(--vkui--color_text_secondary)',
    fontWeight: 'medium',
  } as const,
  todayHeaderActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  } as const,
  todayGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px',
  } as const,
  todayCard: {
    border: '1px solid var(--vkui--color_border)',
    borderRadius: '8px',
    padding: '12px',
    backgroundColor: 'var(--vkui--color_background_secondary)',
  } as const,
};

export const DashboardPage: React.FC = memo(() => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isMobile, isTablet } = useMobile();

  // Статистика
  const [stats, setStats] = useState({
    todayBookings: 0,
    weekBookings: 0,
    monthBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [businessData, bookingsData] = await Promise.all([
        apiService.getBusiness(businessId!),
        apiService.getBookings(businessId!, {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString(),
        }),
      ]);

      setBusiness(businessData);
      setBookings(bookingsData);

      // Расчет статистики
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const todayBookings = bookingsData.filter(
        (b) => new Date(b.startTs) >= today
      ).length;

      const weekBookings = bookingsData.filter(
        (b) => new Date(b.startTs) >= weekAgo
      ).length;

      const monthBookings = bookingsData.filter(
        (b) => new Date(b.startTs) >= monthAgo
      ).length;

      const pendingBookings = bookingsData.filter(
        (b) => b.status === 'PENDING'
      ).length;

      const confirmedBookings = bookingsData.filter(
        (b) => b.status === 'CONFIRMED'
      ).length;

      const completedBookings = bookingsData.filter(
        (b) => b.status === 'COMPLETED'
      ).length;

      const cancelledBookings = bookingsData.filter(
        (b) => b.status === 'CANCELLED'
      ).length;

      const completedBookingsData = bookingsData.filter(
        (b) => b.status === 'COMPLETED'
      );

      const totalRevenue = completedBookingsData.reduce(
        (sum, b) => sum + (b.service?.price || 0),
        0
      );

      const averageBookingValue = completedBookingsData.length > 0
        ? totalRevenue / completedBookingsData.length
        : 0;

      setStats({
        todayBookings,
        weekBookings,
        monthBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        averageBookingValue,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка загрузки данных'
        : 'Ошибка загрузки данных';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      loadDashboardData();
    }
  }, [businessId, loadDashboardData]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Ожидает';
      case 'CONFIRMED': return 'Подтверждена';
      case 'CANCELLED': return 'Отменена';
      case 'COMPLETED': return 'Завершена';
      case 'NO_SHOW': return 'Не пришел';
      default: return status;
    }
  };

  // Мемоизируем вычисляемые значения
  const todayBookings = useMemo(() =>
    bookings.filter((b) => new Date(b.startTs).toDateString() === new Date().toDateString())
  , [bookings]);

  const statsGridTemplateColumns = useMemo(() => (
    isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'
  ), [isMobile, isTablet]);

  const handleBack = useCallback(() => navigate('/businesses'), [navigate]);
  const goToBookings = useCallback(() => navigate(`/businesses/${businessId}/bookings`), [navigate, businessId]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div>
        <Group>
          <Alert
            onClose={() => setError('')}
            actions={[
              {
                title: 'Повторить',
                mode: 'default',
                action: loadDashboardData,
              },
            ]}
          >
            {error}
          </Alert>
        </Group>
      </div>
    );
  }

  if (!businessId) {
    return (
      <Group>
        <Alert onClose={() => navigate('/businesses')}>Не указан бизнес</Alert>
      </Group>
    );
  }

  return (
    <div>
      {/* Заголовок */}
      <Group>
        <Header>
          <Title level="1">📊 Дашборд{business ? ` — ${business.name}` : ''}</Title>
        </Header>
        <Div style={DASHBOARD_STYLES.headerActions}>
          <div style={DASHBOARD_STYLES.headerLeft}>
            <Button
              size="s"
              mode="tertiary"
              onClick={handleBack}
            >
              ← Назад
            </Button>
          </div>
          <Button
            size="m"
            mode="secondary"
            onClick={goToBookings}
          >
            Управление записями
          </Button>
        </Div>
      </Group>

      {/* Основная статистика */}
      <Group separator="hide">
        <div style={{
          display: 'grid',
          gridTemplateColumns: statsGridTemplateColumns,
          gap: '16px',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <StatCard
            title="Записи сегодня"
            value={stats.todayBookings}
            subtitle="Всего записей на сегодня"
            icon="📅"
            color="primary"
            onClick={() => navigate(`/businesses/${businessId}/bookings`)}
          />
          <StatCard
            title="За неделю"
            value={stats.weekBookings}
            subtitle="Записей за последние 7 дней"
            icon="📊"
            color="success"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Выручка"
            value={`${stats.totalRevenue.toLocaleString()} ₽`}
            subtitle="За последние 30 дней"
            icon="💰"
            color="warning"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Средний чек"
            value={`${Math.round(stats.averageBookingValue).toLocaleString()} ₽`}
            subtitle="Средняя стоимость записи"
            icon="📈"
            color="info"
            trend={{ value: 5, isPositive: true }}
          />
        </div>
      </Group>

      {/* Статусы записей */}
      <Group>
        <VKCard mode="outline">
          <Group>
            <Header>
              <Text weight="2">Статусы записей</Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                Распределение записей по статусам
              </Text>
            </Header>
            <Div>
              <div style={DASHBOARD_STYLES.statusesGrid}>
                <div style={DASHBOARD_STYLES.statusBadgeContainer}>
                  <Badge
                    mode="prominent"
                    style={{
                      ...DASHBOARD_STYLES.statusBadge,
                      backgroundColor: 'var(--vkui--color_accent_orange)'
                    }}
                  >
                    {stats.pendingBookings}
                  </Badge>
                  <Text style={DASHBOARD_STYLES.statusText}>
                    Ожидают
                  </Text>
                </div>

                <div style={DASHBOARD_STYLES.statusBadgeContainer}>
                  <Badge
                    mode="prominent"
                    style={{
                      ...DASHBOARD_STYLES.statusBadge,
                      backgroundColor: 'var(--vkui--color_accent_blue)'
                    }}
                  >
                    {stats.confirmedBookings}
                  </Badge>
                  <Text style={DASHBOARD_STYLES.statusText}>
                    Подтверждены
                  </Text>
                </div>

                <div style={DASHBOARD_STYLES.statusBadgeContainer}>
                  <Badge
                    mode="prominent"
                    style={{
                      ...DASHBOARD_STYLES.statusBadge,
                      backgroundColor: 'var(--vkui--color_accent_green)'
                    }}
                  >
                    {stats.completedBookings}
                  </Badge>
                  <Text style={DASHBOARD_STYLES.statusText}>
                    Завершены
                  </Text>
                </div>

                <div style={DASHBOARD_STYLES.statusBadgeContainer}>
                  <Badge
                    mode="prominent"
                    style={{
                      ...DASHBOARD_STYLES.statusBadge,
                      backgroundColor: 'var(--vkui--color_accent_red)'
                    }}
                  >
                    {stats.cancelledBookings}
                  </Badge>
                  <Text style={DASHBOARD_STYLES.statusText}>
                    Отменены
                  </Text>
                </div>
              </div>
            </Div>
          </Group>
        </VKCard>
      </Group>

      {/* Записи на сегодня */}
      <Group>
        <VKCard mode="outline">
          <Group>
            <Header>
              <Text weight="2">Записи на сегодня</Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                {todayBookings.length} записей
              </Text>
            </Header>
            <Div style={DASHBOARD_STYLES.todayHeaderActions}>
              <Button
                mode="tertiary"
                size="s"
                onClick={goToBookings}
              >
                Все записи
              </Button>
            </Div>
            <Div>
              <div style={DASHBOARD_STYLES.todayGrid}>
                {todayBookings.map((booking) => (
                  <div key={booking.id} style={DASHBOARD_STYLES.todayCard}>
                    <Text style={{ fontWeight: 'bold' }}>
                      {new Date(booking.startTs).toLocaleTimeString()}
                    </Text>
                    <Text style={{ fontSize: '14px' }}>
                      {booking.service?.title}
                    </Text>
                    <Text style={{ fontSize: '12px' }}>
                      {booking.client?.name}
                    </Text>
                    <Text style={{ fontSize: '12px' }}>
                      Статус: {getStatusText(booking.status)}
                    </Text>
                  </div>
                ))}
              </div>
            </Div>
          </Group>
        </VKCard>
      </Group>
    </div>
  );
});