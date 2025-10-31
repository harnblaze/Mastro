import { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';

// Типы для VK OAuth
declare global {
  interface Window {
    VK: {
      init: (config: { apiId: number }) => void;
      Auth: {
        login: (callback: (response: any) => void, scope: string) => void;
        logout: (callback: () => void) => void;
        getSession: () => any;
      };
      Api: {
        call: (method: string, params: any, callback: (response: any) => void) => void;
      };
    };
  }
}

// VK OAuth для браузера
const initVkOAuth = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.VK) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://vk.com/js/api/openapi.js?169';
    script.async = true;
    script.onload = () => {
      const appId = import.meta.env.VITE_VK_APP_ID;
      if (!appId) {
        reject(new Error('VITE_VK_APP_ID не задан'));
        return;
      }
      
      window.VK.init({
        apiId: Number(appId)
      });
      resolve();
    };
    script.onerror = () => reject(new Error('Не удалось загрузить VK API'));
    document.head.appendChild(script);
  });
};

const vkOAuthLogin = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    window.VK.Auth.login((response: any) => {
      if (response.session) {
        resolve(response.session.access_token);
      } else {
        reject(new Error('Не удалось получить токен VK'));
      }
    }, 'email');
  });
};

export const useVkBridge = () => {
  const [isReady, setIsReady] = useState(false);
  const [isWebView, setIsWebView] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vkBridge, setVkBridge] = useState<any>(null);

  useEffect(() => {
    const initVkBridge = async () => {
      try {
        // Проверяем, есть ли реальный VK Bridge (WebView)
        if (bridge.isWebView()) {
          console.log('🔄 Using real VK Bridge (WebView)');
          setVkBridge(bridge);
          setIsWebView(true);
          await bridge.send('VKWebAppInit');
        } else {
          console.log('🔄 Using VK OAuth for browser');
          setIsWebView(false);
          await initVkOAuth();
        }
        
        setIsReady(true);
      } catch (err) {
        console.error('VK initialization error:', err);
        setError('Ошибка инициализации VK');
        setIsReady(false);
      }
    };

    initVkBridge();
  }, []);

  const getAuthToken = async (): Promise<string | null> => {
    if (!isReady) {
      return null;
    }

    try {
      if (isWebView && vkBridge) {
        // Используем VK Bridge для WebView
        const appIdEnv = import.meta.env.VITE_VK_APP_ID;
        const appId = appIdEnv ? Number(appIdEnv) : undefined;
        
        if (!appId || Number.isNaN(appId)) {
          throw new Error('Не задан VITE_VK_APP_ID');
        }

        const response = await vkBridge.send(
          'VKWebAppGetAuthToken',
          {
            app_id: appId,
            scope: 'email',
          },
        );
        return response.access_token || null;
      } else {
        // Используем VK OAuth для браузера
        console.log('🔑 Getting VK token via OAuth...');
        const token = await vkOAuthLogin();
        return token;
      }
    } catch (err) {
      console.error('VK auth token error:', err);
      return null;
    }
  };

  const getUserInfo = async () => {
    if (!isReady) {
      return null;
    }

    try {
      if (isWebView && vkBridge) {
        const userInfo = await vkBridge.send('VKWebAppGetUserInfo');
        return userInfo;
      } else {
        // Для браузера получаем информацию через VK API
        return new Promise((resolve, reject) => {
          window.VK.Api.call('users.get', { fields: 'photo_200,email' }, (response: any) => {
            if (response.response) {
              resolve(response.response[0]);
            } else {
              reject(new Error('Не удалось получить информацию о пользователе'));
            }
          });
        });
      }
    } catch (err) {
      console.error('VK user info error:', err);
      return null;
    }
  };

  const showOrderBox = async (orderData: any) => {
    if (!isReady) {
      return null;
    }

    try {
      if (isWebView && vkBridge) {
        const result = await vkBridge.send('VKWebAppShowOrderBox', orderData);
        return result;
      } else {
        // Для браузера просто показываем alert
        alert(`Заказ: ${JSON.stringify(orderData)}`);
        return { result: true };
      }
    } catch (err) {
      console.error('VK order box error:', err);
      return null;
    }
  };

  const openLink = async (url: string) => {
    if (!isReady) {
      window.open(url, '_blank');
      return;
    }

    try {
      if (isWebView && vkBridge) {
        await vkBridge.send('VKWebAppOpenURL', { url });
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('VK open link error:', err);
      window.open(url, '_blank');
    }
  };

  const showSnackbar = async (message: string) => {
    if (!isReady) {
      alert(message);
      return;
    }

    try {
      if (isWebView && vkBridge) {
        await vkBridge.send('VKWebAppShowSnackbar', { text: message });
      } else {
        alert(message);
      }
    } catch (err) {
      console.error('VK snackbar error:', err);
      alert(message);
    }
  };

  const closeApp = async () => {
    if (!isReady) {
      return;
    }

    try {
      if (isWebView && vkBridge) {
        await vkBridge.send('VKWebAppClose', { status: 'success' });
      } else {
        // Для браузера просто закрываем вкладку
        window.close();
      }
    } catch (err) {
      console.error('VK close app error:', err);
    }
  };

  return {
    isReady,
    isWebView,
    error,
    getAuthToken,
    getUserInfo,
    showOrderBox,
    openLink,
    showSnackbar,
    closeApp,
  };
};
