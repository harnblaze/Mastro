import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { View, Panel, PanelHeader, Button, Div, Text } from '@vkontakte/vkui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View activePanel="error">
          <Panel id="error">
            <PanelHeader>Ошибка</PanelHeader>
            <Div style={{ padding: '20px', textAlign: 'center' }}>
              <Text style={{ fontSize: '18px', marginBottom: '16px' }}>
                Что-то пошло не так 😔
              </Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: '20px' }}>
                Произошла непредвиденная ошибка. Попробуйте обновить страницу.
              </Text>
              <Button
                mode="primary"
                onClick={() => window.location.reload()}
              >
                Обновить страницу
              </Button>
            </Div>
          </Panel>
        </View>
      );
    }

    return this.props.children;
  }
}

// Компонент для 404 страницы
export const NotFoundPage: React.FC = () => {
  return (
    <View activePanel="not-found">
      <Panel id="not-found">
        <PanelHeader>Страница не найдена</PanelHeader>
        <Div style={{ padding: '20px', textAlign: 'center' }}>
          <Text style={{ fontSize: '48px', marginBottom: '16px' }}>
            🔍
          </Text>
          <Text style={{ fontSize: '18px', marginBottom: '8px' }}>
            Страница не найдена
          </Text>
          <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: '20px' }}>
            Запрашиваемая страница не существует или была перемещена.
          </Text>
          <Button
            mode="primary"
            onClick={() => window.history.back()}
          >
            Вернуться назад
          </Button>
        </Div>
      </Panel>
    </View>
  );
};
