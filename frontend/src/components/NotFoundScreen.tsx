import React from 'react';
import { Div, Group, Text, Button } from '@vkontakte/vkui';

interface NotFoundScreenProps {
  icon?: string;
  title?: string;
  message?: string;
  buttonText?: string;
  onAction: () => void;
}

export const NotFoundScreen: React.FC<NotFoundScreenProps> = ({
  icon = '❌',
  title = 'Данные не найдены',
  message = 'Возможно, данные были удалены или произошла ошибка',
  buttonText = 'Назад',
  onAction,
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
          {icon}
        </Text>
        <Text weight="2" style={{ fontSize: '20px', marginBottom: '8px' }}>
          {title}
        </Text>
        <Text style={{ marginBottom: '24px', color: 'var(--vkui--color_text_secondary)' }}>
          {message}
        </Text>
        <Button size="m" mode="primary" onClick={onAction}>
          {buttonText}
        </Button>
      </Div>
    </Group>
  </div>
);

