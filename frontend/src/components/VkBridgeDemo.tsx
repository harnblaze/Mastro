import { useEffect, useState, useCallback, memo } from 'react';
import { Button, Text, Card } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';

// Константы для стилей
const DEMO_STYLES = {
  card: {
    margin: '16px',
  },
  title: {
    marginBottom: '12px',
  },
  status: {
    marginBottom: '12px',
    color: '#6D7885',
  },
  info: {
    marginBottom: '12px',
    fontSize: '14px',
  },
  button: {
    marginRight: '8px',
    marginBottom: '8px',
  },
} as const;

export const VkBridgeDemo = memo(() => {
  const [vkInfo, setVkInfo] = useState<Record<string, unknown> | null>(null);
  const [isVkApp, setIsVkApp] = useState(false);

  // Мемоизируем функцию проверки VK окружения
  const checkVkEnvironment = useCallback(async () => {
    try {
      const info = await bridge.send('VKWebAppGetLaunchParams');
      setIsVkApp(true);
      setVkInfo(info);
    } catch {
      console.log('Не запущено в VK, работаем в веб-режиме');
      setIsVkApp(false);
    }
  }, []);

  // Мемоизируем обработчик VK авторизации
  const handleVkAuth = useCallback(async () => {
    try {
      const result = await bridge.send('VKWebAppGetAuthToken', {
        app_id: parseInt(import.meta.env.VITE_VK_APP_ID || '0'),
        scope: 'email',
      });
      
      console.log('VK Auth result:', result);
      // Здесь можно использовать полученный токен для авторизации
    } catch (error) {
      console.error('VK Auth error:', error);
    }
  }, []);

  // Мемоизируем обработчик поделиться
  const handleShare = useCallback(async () => {
    try {
      await bridge.send('VKWebAppShare', {
        link: window.location.href,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, []);

  useEffect(() => {
    checkVkEnvironment();
  }, [checkVkEnvironment]);

  return (
    <Card style={DEMO_STYLES.card}>
      <div>
        <Text weight="2" style={DEMO_STYLES.title}>
          VK Bridge Demo
        </Text>
        
        <Text style={DEMO_STYLES.status}>
          Статус: {isVkApp ? 'Запущено в VK' : 'Веб-режим'}
        </Text>

        {vkInfo && (
          <Text style={DEMO_STYLES.info}>
            Параметры запуска: {JSON.stringify(vkInfo, null, 2)}
          </Text>
        )}

        {isVkApp && (
          <div>
            <Button
              size="s"
              style={DEMO_STYLES.button}
              onClick={handleVkAuth}
            >
              VK Авторизация
            </Button>
            
            <Button
              size="s"
              mode="secondary"
              onClick={handleShare}
            >
              Поделиться
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
});
