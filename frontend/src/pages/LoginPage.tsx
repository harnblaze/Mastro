import { useState, useEffect, useCallback, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FormItem,
  Input,
  Button,
  Div,
  Text,
  Tabs,
  TabsItem,
  Alert,
} from '@vkontakte/vkui';
import { useAuth } from '../contexts/AuthContext';
import { useVkBridge } from '../hooks/useVkBridge';

// Константы для стилей
const LOGIN_STYLES = {
  container: {
    padding: '16px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },
  formContainer: {
    padding: '20px 0',
    maxWidth: '400px',
    margin: '0 auto',
    width: '100%',
  },
  formContainerMobile: {
    padding: '16px 0',
    maxWidth: '400px',
    margin: '0 auto',
    width: '100%',
  },
  title: {
    marginBottom: '20px',
    textAlign: 'center' as const,
    fontSize: '24px',
  },
  titleMobile: {
    marginBottom: '20px',
    textAlign: 'center' as const,
    fontSize: '20px',
  },
  subtitle: {
    marginBottom: '20px',
    textAlign: 'center' as const,
    color: '#6D7885',
    fontSize: '16px',
  },
  subtitleMobile: {
    marginBottom: '20px',
    textAlign: 'center' as const,
    color: '#6D7885',
    fontSize: '14px',
  },
  vkButton: {
    marginTop: '20px',
    textAlign: 'center' as const,
  },
} as const;

export const LoginPage = memo(() => {
  const { login, register, vkAuth, isAuthenticated, user } = useAuth();
  const { isReady, getAuthToken } = useVkBridge();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Проверяем ошибку из URL параметров (например, из VK callback)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
      setSearchParams({}, { replace: true }); // Очищаем параметр из URL
    }
  }, [searchParams, setSearchParams]);

  // Мемоизируем функцию перенаправления
  const redirectToBusinesses = useCallback(() => {
    console.log('🎯 Redirecting to /businesses after successful auth');
    window.location.replace('/businesses');
  }, []);

  // Перенаправление после успешной авторизации
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectToBusinesses();
    }
  }, [isAuthenticated, user, redirectToBusinesses]);

  // Мемоизируем обработчик отправки формы
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (activeTab === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      
      // Небольшая задержка для корректного перенаправления
      setTimeout(redirectToBusinesses, 100);
    } catch (err: any) {
      console.error('❌ Auth error:', err);
      setError(err.response?.data?.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, email, password, login, register, redirectToBusinesses]);

  // Мемоизируем обработчик VK авторизации
  const handleVkAuth = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!isReady) {
        throw new Error('VK Bridge не готов');
      }

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Не удалось получить VK токен');
      }
      
      await vkAuth(token);
      setTimeout(redirectToBusinesses, 100);
    } catch (err: any) {
      console.error('VK Auth error:', err);
      setError(err.message || 'Ошибка авторизации через VK');
    } finally {
      setIsLoading(false);
    }
  }, [isReady, getAuthToken, vkAuth, redirectToBusinesses]);

  // Мемоизируем обработчик смены таба
  const handleTabChange = useCallback((tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError(''); // Очищаем ошибки при смене таба
  }, []);

  // Мемоизируем обработчик очистки ошибки
  const handleClearError = useCallback(() => {
    setError('');
  }, []);

  // Определяем мобильную версию
  const isMobile = window.innerWidth < 768;

  return (
    <Div style={LOGIN_STYLES.container}>
      <Tabs>
        <TabsItem
          selected={activeTab === 'login'}
          onClick={() => handleTabChange('login')}
        >
          Вход
        </TabsItem>
        <TabsItem
          selected={activeTab === 'register'}
          onClick={() => handleTabChange('register')}
        >
          Регистрация
        </TabsItem>
      </Tabs>

      <Div style={isMobile ? LOGIN_STYLES.formContainerMobile : LOGIN_STYLES.formContainer}>
        <Text weight="2" style={isMobile ? LOGIN_STYLES.titleMobile : LOGIN_STYLES.title}>
          Добро пожаловать в Mastro
        </Text>
        <Text style={isMobile ? LOGIN_STYLES.subtitleMobile : LOGIN_STYLES.subtitle}>
          Сервис бронирования для самозанятых и салонов
        </Text>

        {error && (
          <Alert
            onClose={handleClearError}
            actions={[
              {
                title: 'Понятно',
                mode: 'cancel',
                action: handleClearError,
              },
            ]}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Div>
            <FormItem top="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
                required
              />
            </FormItem>

            <FormItem top="Пароль">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </FormItem>

            <FormItem>
              <Button
                type="submit"
                size="l"
                stretched
                loading={isLoading}
                disabled={!email || !password}
              >
                {activeTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </Button>
            </FormItem>
          </Div>
        </form>

        <Div style={LOGIN_STYLES.vkButton}>
          <Button
            size="l"
            stretched
            mode="secondary"
            onClick={handleVkAuth}
            loading={isLoading}
            disabled={!isReady}
          >
            Войти через VK
          </Button>
        </Div>
      </Div>
    </Div>
  );
});
