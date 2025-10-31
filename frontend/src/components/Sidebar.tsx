import { useState, useMemo, useCallback, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Div,
  Separator,
  Text,
} from '@vkontakte/vkui';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  path: string;
}

// Конфигурация меню вынесена в константу для переиспользования
const MENU_CONFIG: Omit<MenuItem, 'path'>[] = [
  { id: 'dashboard', title: 'Дашборд', icon: '📊' },
  { id: 'calendar', title: 'Календарь', icon: '📅' },
  { id: 'bookings', title: 'Записи', icon: '📋' },
  { id: 'services', title: 'Услуги', icon: '💅' },
  { id: 'staff', title: 'Сотрудники', icon: '👥' },
  { id: 'clients', title: 'Клиенты', icon: '👤' },
  { id: 'notifications', title: 'Уведомления', icon: '📢' },
  { id: 'settings', title: 'Настройки', icon: '⚙️' },
  { id: 'availability', title: 'Доступность', icon: '📅' },
  { id: 'notification-templates', title: 'Шаблоны', icon: '📝' },
];

export const Sidebar = memo<SidebarProps>(({ businessId, isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Мемоизируем menuItems чтобы они не пересоздавались при каждом рендере
  const menuItems = useMemo(() => 
    MENU_CONFIG.map(item => ({
      ...item,
      path: `/businesses/${businessId}/${item.id}`,
    })), [businessId]
  );

  // Мемоизируем обработчики событий
  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    logout();
    setShowLogoutModal(false);
  }, [logout]);

  const handleBackToBusinesses = useCallback(() => {
    navigate('/businesses');
    onClose();
  }, [navigate, onClose]);

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 400,
            display: 'block',
          }}
          onClick={onClose}
        />
      )}

      {/* Сайдбар */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-280px',
          width: '280px',
          height: '100vh',
          backgroundColor: 'var(--vkui--color_background)',
          borderRight: '1px solid var(--vkui--color_border)',
          zIndex: 500,
          transition: 'left 0.3s ease',
          overflowY: 'auto',
          boxShadow: isOpen ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <Div>
          {/* Заголовок */}
          <div style={{
            padding: '20px 16px',
            borderBottom: '1px solid var(--vkui--color_border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--vkui--color_background)',
          }}>
            <Text style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--vkui--color_text_primary)',
            }}>
              Mastro Admin
            </Text>
            <Button
              mode="secondary"
              size="s"
              onClick={onClose}
              style={{
                padding: 0,
                minWidth: '32px',
              }}
            >
              ×
            </Button>
          </div>

          {/* Навигация */}
          <div style={{ padding: '16px 0' }}>
            {menuItems.map((item, index) => (
              <div key={item.id}>
                <Button
                  mode={isActive(item.path) ? 'secondary' : 'tertiary'}
                  size="m"
                  onClick={() => handleNavigation(item.path)}
                  style={{
                    margin: '4px 16px',
                    justifyContent: 'flex-start',
                  }}
                  before={
                    <span style={{
                      fontSize: '18px',
                      opacity: 0.8,
                    }}>
                      {item.icon}
                    </span>
                  }
                >
                  {item.title}
                </Button>
                {index < menuItems.length - 1 && (
                  <Separator style={{
                    margin: '8px 24px',
                    backgroundColor: 'var(--vkui--color_border)',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Дополнительные действия */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid var(--vkui--color_border)',
            marginTop: 'auto',
            backgroundColor: 'var(--vkui--color_background)',
          }}>
            <Button
              mode="secondary"
              size="m"
              onClick={handleBackToBusinesses}
              style={{
                width: '100%',
                marginBottom: '8px',
              }}
              before={<span>←</span>}
            >
              К списку бизнесов
            </Button>
            <Button
              mode="outline"
              appearance="negative"
              size="m"
              onClick={handleLogoutClick}
              style={{
                width: '100%',
                color: 'var(--vkui--color_accent_red)',
                borderColor: 'var(--vkui--color_accent_red)',
              }}
              before={<span>🚪</span>}
            >
              Выйти
            </Button>
          </div>
        </Div>
      </div>

      {/* Модальное окно подтверждения выхода */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
});
