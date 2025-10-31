import React, { useEffect } from 'react';
import { Div, Text, Spinner } from '@vkontakte/vkui';
import { useAuth } from '../contexts/AuthContext';

/**
 * Страница обработки callback от VK OAuth
 * VK редиректит сюда после успешной авторизации с токеном в URL hash
 */
export const VkCallbackPage: React.FC = () => {
  const { vkAuth } = useAuth();

  useEffect(() => {
    // Извлекаем токен из URL hash и query параметров
    const hash = window.location.hash;
    const search = window.location.search;
    const hashParams = new URLSearchParams(hash.substring(1));
    const searchParams = new URLSearchParams(search);
    
    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    const error = hashParams.get('error') || searchParams.get('error');
    const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

    if (accessToken) {
      // Отправляем токен родительскому окну (popup)
      if (window.opener) {
        window.opener.postMessage(
          { type: 'VK_AUTH_SUCCESS', token: accessToken },
          window.location.origin
        );
        // Даем время на отправку сообщения перед закрытием
        setTimeout(() => {
          window.close();
        }, 100);
      } else {
        // Если нет popup (прямой переход), используем токен напрямую
        vkAuth(accessToken)
          .then(() => {
            window.location.href = '/businesses';
          })
          .catch((err) => {
            console.error('VK auth error:', err);
            window.location.href = `/login?error=${encodeURIComponent(err.message || 'Ошибка авторизации')}`;
          });
      }
    } else if (error) {
      const errorMsg = errorDescription || error;
      console.error('VK OAuth error:', error, errorDescription);
      
      // Отправляем ошибку родительскому окну
      if (window.opener) {
        window.opener.postMessage(
          { type: 'VK_AUTH_ERROR', error: errorMsg },
          window.location.origin
        );
        // Даем время на отправку сообщения перед закрытием
        setTimeout(() => {
          window.close();
        }, 100);
      } else {
        // Если нет popup, редиректим на страницу логина с ошибкой
        window.location.href = `/login?error=${encodeURIComponent(errorMsg)}`;
      }
    } else {
      // Неизвестная ошибка - возможно, страница загрузилась без параметров
      console.warn('VK callback page loaded without token or error');
      if (window.opener) {
        window.opener.postMessage(
          { type: 'VK_AUTH_ERROR', error: 'Неизвестная ошибка авторизации' },
          window.location.origin
        );
        setTimeout(() => {
          window.close();
        }, 100);
      } else {
        window.location.href = '/login?error=unknown';
      }
    }
  }, [vkAuth]);

  return (
    <Div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Spinner size="large" />
      <Text style={{ marginTop: '20px', textAlign: 'center' }}>
        Обработка авторизации...
      </Text>
    </Div>
  );
};

