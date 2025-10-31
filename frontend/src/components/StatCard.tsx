import React, { useMemo, memo } from 'react';
import { 
  Card, 
  Div, 
  Text, 
  Avatar,
  SimpleCell
} from '@vkontakte/vkui';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
}

// Цветовая схема вынесена в константу для оптимизации
const COLOR_STYLES = {
  success: { color: 'var(--vkui--color_accent_green)' },
  warning: { color: 'var(--vkui--color_accent_orange)' },
  error: { color: 'var(--vkui--color_accent_red)' },
  info: { color: 'var(--vkui--color_accent_blue)' },
  primary: { color: 'var(--vkui--color_accent_blue)' },
} as const;

export const StatCard = memo<StatCardProps>(({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  onClick,
}) => {
  // Мемоизируем стили цвета
  const colorStyle = useMemo(() => COLOR_STYLES[color], [color]);

  // Мемоизируем стили карточки
  const cardStyle = useMemo(() => ({
    cursor: onClick ? 'pointer' : 'default',
    minWidth: 0,
    overflow: 'hidden'
  }), [onClick]);

  // Мемоизируем стили значения
  const valueStyle = useMemo(() => ({
    fontSize: '28px', 
    lineHeight: 1,
    ...colorStyle,
    wordBreak: 'break-word' as const,
  }), [colorStyle]);

  // Мемоизируем стили заголовка
  const titleStyle = useMemo(() => ({
    fontSize: '12px',
    color: 'var(--vkui--color_text_secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginTop: '4px',
    wordBreak: 'break-word' as const,
  }), []);

  // Мемоизируем стили подзаголовка
  const subtitleStyle = useMemo(() => ({
    fontSize: '14px',
    color: 'var(--vkui--color_text_secondary)',
    marginTop: '4px',
    wordBreak: 'break-word' as const,
  }), []);

  // Мемоизируем стили тренда
  const trendStyle = useMemo(() => ({
    fontSize: '12px',
    color: trend?.isPositive 
      ? 'var(--vkui--color_accent_green)' 
      : 'var(--vkui--color_accent_red)'
  }), [trend?.isPositive]);

  return (
    <Card mode="outline" onClick={onClick} style={cardStyle}>
      <SimpleCell
        before={icon ? <Avatar size={40}>{icon}</Avatar> : undefined}
        after={trend ? (
          <Div>
            <Text style={trendStyle}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </Text>
          </Div>
        ) : undefined}
      >
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <Text weight="3" style={valueStyle}>
            {value}
          </Text>
          <Text style={titleStyle}>
            {title}
          </Text>
          {subtitle && (
            <Text style={subtitleStyle}>
              {subtitle}
            </Text>
          )}
        </div>
      </SimpleCell>
    </Card>
  );
});

interface StatGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export const StatGrid = memo<StatGridProps>(({ children, columns = 4 }) => {
  // Мемоизируем стили сетки
  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '16px',
  }), [columns]);

  return (
    <div style={gridStyle}>
      {children}
    </div>
  );
});