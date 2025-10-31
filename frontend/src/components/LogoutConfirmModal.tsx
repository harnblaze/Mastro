import { useState, useCallback, memo } from 'react';
import { Modal } from './Modal';
import { Button, Div, Text } from '@vkontakte/vkui';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Константы для стилей
const MODAL_STYLES = {
  container: {
    textAlign: 'center' as const,
    padding: '20px',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  title: {
    margin: 0,
    marginBottom: '8px',
    color: 'var(--vkui--color_text_primary)',
  },
  subtitle: {
    margin: 0,
    color: 'var(--vkui--color_text_secondary)',
    fontSize: '14px',
  },
} as const;

export const LogoutConfirmModal = memo<LogoutConfirmModalProps>(({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Мемоизируем обработчик подтверждения
  const handleConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
    } finally {
      setIsLoggingOut(false);
    }
  }, [onConfirm]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Подтверждение выхода"
      size="small"
      actions={
        <>
          <Button
            mode="secondary"
            size="m"
            onClick={onClose}
            disabled={isLoggingOut}
          >
            Отмена
          </Button>
          <Button
            mode="primary"
            appearance="negative"
            size="m"
            onClick={handleConfirm}
            loading={isLoggingOut}
          >
            Выйти
          </Button>
        </>
      }
    >
      <Div style={MODAL_STYLES.container}>
        <div style={MODAL_STYLES.icon}>
          🚪
        </div>
        <Text weight="2" style={MODAL_STYLES.title}>
          Вы уверены, что хотите выйти?
        </Text>
        <Text style={MODAL_STYLES.subtitle}>
          Вам потребуется войти в систему заново для доступа к админ-панели
        </Text>
      </Div>
    </Modal>
  );
});
