import React from 'react';
import { 
  Card as VKCard, 
  Div, 
  Text, 
  Group,
  Header,
  Avatar
} from '@vkontakte/vkui';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  icon,
  onClick,
  className,
  style,
}) => {
  return (
    <VKCard 
      mode="outline" 
      className={className}
      style={{
        ...(onClick && { cursor: 'pointer' }),
        ...style,
      }}
      onClick={onClick}
    >
      {/* Заголовок карточки */}
      {(title || subtitle || actions || icon) && (
        <Group>
          <Header>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {icon && <Avatar size={32}>{icon}</Avatar>}
              <div style={{ flex: 1 }}>
                {title && (
                  <Text weight="2" style={{ fontSize: '18px', marginBottom: subtitle ? '4px' : 0 }}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text style={{ 
                    color: 'var(--vkui--color_text_secondary)', 
                    fontSize: '14px' 
                  }}>
                    {subtitle}
                  </Text>
                )}
              </div>
              {actions && (
                <div>
                  {actions}
                </div>
              )}
            </div>
          </Header>
        </Group>
      )}

      {/* Контент карточки */}
      <Div>
        {children}
      </Div>
    </VKCard>
  );
};

interface CardGridProps {
  children: React.ReactNode;
  gap?: 'sm' | 'md' | 'lg';
}

export const CardGrid: React.FC<CardGridProps> = ({ 
  children, 
  gap = 'lg' 
}) => {
  const getGapSize = () => {
    switch (gap) {
      case 'sm':
        return '8px';
      case 'md':
        return '12px';
      case 'lg':
        return '16px';
      default:
        return '16px';
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: getGapSize(),
        gridTemplateColumns: `repeat(auto-fit, minmax(300px, 1fr))`,
      }}
    >
      {children}
    </div>
  );
};

interface EmptyCardProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const EmptyCard: React.FC<EmptyCardProps> = ({
  icon,
  title,
  subtitle,
  action,
}) => {
  return (
    <VKCard mode="outline">
      <Div style={{ textAlign: 'center', padding: '40px 20px' }}>
        {icon && (
          <Text weight="2" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
            {icon}
          </Text>
        )}
        <Text weight="2" style={{ fontSize: '18px', marginBottom: subtitle ? '8px' : '16px' }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ 
            color: 'var(--vkui--color_text_secondary)', 
            fontSize: '16px',
            marginBottom: '24px',
            maxWidth: '300px',
            margin: '0 auto 24px auto'
          }}>
            {subtitle}
          </Text>
        )}
        {action}
      </Div>
    </VKCard>
  );
};
