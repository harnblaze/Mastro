import React from 'react';
import { Div, Group, Text, Button } from '@vkontakte/vkui';

interface ErrorScreenProps {
  title?: string;
  message: string;
  onRetry: () => void;
  retryButtonText?: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Ошибка загрузки',
  message,
  onRetry,
  retryButtonText = 'Повторить',
}) => (
  <div>
    <Group>
      <Div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--vkui--color_text_primary)',
        }}
      >
        <Text weight="2" style={{ fontSize: '48px', marginBottom: '16px' }}>
          ⚠️
        </Text>
        <Text weight="2" style={{ fontSize: '20px', marginBottom: '8px' }}>
          {title}
        </Text>
        <Text style={{ marginBottom: '24px' }}>{message}</Text>
        <Button size="m" mode="primary" onClick={onRetry}>
          {retryButtonText}
        </Button>
      </Div>
    </Group>
  </div>
);

