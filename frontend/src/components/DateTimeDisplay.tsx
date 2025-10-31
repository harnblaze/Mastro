import { useMemo, memo } from 'react';
import { Text } from '@vkontakte/vkui';

interface DateTimeDisplayProps {
  dateTime: string | Date;
  format?: 'date' | 'time' | 'datetime' | 'relative';
  timezone?: string;
}

// Константы для форматирования даты
const DATE_FORMAT_OPTIONS = {
  date: {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  },
  time: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  },
  datetime: {
    year: 'numeric' as const,
    month: 'short' as const,
    day: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  },
  relative: {
    month: 'short' as const,
    day: 'numeric' as const,
  },
} as const;

// Константы для относительного времени
const TIME_INTERVALS = {
  MINUTE: 1000 * 60,
  HOUR: 1000 * 60 * 60,
  DAY: 1000 * 60 * 60 * 24,
  WEEK: 1000 * 60 * 60 * 24 * 7,
} as const;

export const DateTimeDisplay = memo<DateTimeDisplayProps>(({
  dateTime,
  format = 'datetime',
  timezone = 'Europe/Moscow',
}) => {
  // Мемоизируем объект Date для избежания пересоздания
  const date = useMemo(() => new Date(dateTime), [dateTime]);

  // Мемоизируем отформатированную дату
  const formattedDate = useMemo(() => {
    switch (format) {
      case 'date':
        return date.toLocaleDateString('ru-RU', {
          timeZone: timezone,
          ...DATE_FORMAT_OPTIONS.date,
        });
      case 'time':
        return date.toLocaleTimeString('ru-RU', {
          timeZone: timezone,
          ...DATE_FORMAT_OPTIONS.time,
        });
      case 'datetime':
        return date.toLocaleString('ru-RU', {
          timeZone: timezone,
          ...DATE_FORMAT_OPTIONS.datetime,
        });
      case 'relative':
        return getRelativeTime(date, timezone);
      default:
        return date.toLocaleString('ru-RU', { timeZone: timezone });
    }
  }, [date, format, timezone]);

  // Мемоизируем стили текста
  const textStyle = useMemo(() => ({
    fontSize: '14px',
    color: '#6D7885',
  }), []);

  return (
    <Text style={textStyle}>
      {formattedDate}
    </Text>
  );
});

// Оптимизированная функция для относительного времени
const getRelativeTime = (date: Date, timezone: string): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  // Используем константы для лучшей читаемости и производительности
  if (diffInMs < TIME_INTERVALS.MINUTE) {
    return 'только что';
  }
  
  const diffInMinutes = Math.floor(diffInMs / TIME_INTERVALS.MINUTE);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ч назад`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} дн назад`;
  }
  
  // Для дат старше недели показываем дату
  return date.toLocaleDateString('ru-RU', {
    timeZone: timezone,
    ...DATE_FORMAT_OPTIONS.relative,
  });
};
