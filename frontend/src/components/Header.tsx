import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Text, Button
} from '@vkontakte/vkui';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
  businessId?: string;
  onMenuClick: () => void;
  showBackButton?: boolean;
  backPath?: string;
  actions?: React.ReactNode;
  showLogout?: boolean;
  onLogout?: () => void;
}

export const Header = memo<HeaderProps>(({
  title,
  subtitle,
  onMenuClick,
  showBackButton = false,
  backPath,
  actions,
  showLogout = false,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Мемоизируем обработчики событий
  const handleBack = useCallback(() => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  }, [navigate, backPath]);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    if (onLogout) {
      onLogout();
    }
    setShowLogoutModal(false);
  }, [onLogout]);

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'var(--vkui--color_background)',
      borderBottom: '1px solid var(--vkui--color_border)',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Кнопка меню */}
          <Button
            mode="secondary"
            size="m"
            onClick={onMenuClick}
            style={{
              minWidth: '40px',
              padding: 0,
            }}
          >
            ☰
          </Button>

          {/* Кнопка назад */}
          {showBackButton && (
            <Button
              mode="outline"
              size="s"
              onClick={handleBack}
            >
              ← Назад
            </Button>
          )}

          {/* Заголовок */}
          <div>
            <Text style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'var(--vkui--color_text_primary)',
              margin: 0,
            }}>
              {title}
            </Text>
            {subtitle && (
              <Text style={{
                color: 'var(--vkui--color_text_secondary)',
                fontSize: '14px',
                margin: 0,
                marginTop: '4px',
              }}>
                {subtitle}
              </Text>
            )}
          </div>
        </div>

        {/* Дополнительные действия */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {actions}
          {showLogout && onLogout && (
            <Button
              mode="tertiary"
              size="s"
              onClick={handleLogoutClick}
              style={{
                color: 'var(--vkui--color_accent_red)',
                borderColor: 'var(--vkui--color_accent_red)',
              }}
            >
              Выйти
            </Button>
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения выхода */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
});
