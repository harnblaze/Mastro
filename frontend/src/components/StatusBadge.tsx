import { memo, useMemo } from 'react';
import { Badge } from '@vkontakte/vkui';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';
type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

interface StatusBadgeProps {
  status: BookingStatus | NotificationStatus | PaymentStatus;
  type?: 'booking' | 'notification' | 'payment';
}

// Конфигурация статусов вынесена в константы для оптимизации
const STATUS_CONFIGS = {
  booking: {
    PENDING: { text: 'Ожидает', color: '#FFA500' },
    CONFIRMED: { text: 'Подтверждена', color: '#0077FF' },
    COMPLETED: { text: 'Завершена', color: '#4CAF50' },
    CANCELLED: { text: 'Отменена', color: '#F44336' },
    NO_SHOW: { text: 'Не пришел', color: '#9E9E9E' },
  },
  notification: {
    PENDING: { text: 'Ожидает', color: '#FFA500' },
    SENT: { text: 'Отправлено', color: '#4CAF50' },
    FAILED: { text: 'Ошибка', color: '#F44336' },
  },
  payment: {
    PENDING: { text: 'Ожидает', color: '#FFA500' },
    PAID: { text: 'Оплачено', color: '#4CAF50' },
    REFUNDED: { text: 'Возврат', color: '#9E9E9E' },
  },
} as const;

const DEFAULT_CONFIG = { text: 'Неизвестно', color: '#6D7885' } as const;

export const StatusBadge = memo<StatusBadgeProps>(({ status, type = 'booking' }) => {
  // Мемоизируем конфигурацию статуса
  const config = useMemo(() => {
    const typeConfig = STATUS_CONFIGS[type];
    return typeConfig[status as keyof typeof typeConfig] || DEFAULT_CONFIG;
  }, [status, type]);

  // Мемоизируем стили бейджа
  const badgeStyle = useMemo(() => ({
    backgroundColor: config.color,
  }), [config.color]);

  return (
    <Badge 
      mode="prominent" 
      style={badgeStyle}
    >
      {config.text}
    </Badge>
  );
});
