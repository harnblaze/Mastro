import { useEffect, useMemo, useCallback, memo } from 'react';
import {
  Card,
  Div,
  Title,
  Button,
} from '@vkontakte/vkui';
import { designSystem } from '../styles/designSystem';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

// Константы для размеров модального окна
const MODAL_SIZES = {
  small: { width: '90%', maxWidth: '400px' },
  medium: { width: '90%', maxWidth: '600px' },
  large: { width: '90%', maxWidth: '800px' },
} as const;

// Константы для стилей
const MODAL_STYLES = {
  backdrop: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: designSystem.zIndex.modalBackdrop,
  },
  card: {
    maxHeight: '80vh',
    overflow: 'auto' as const,
    margin: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    justifyContent: 'flex-end' as const,
  },
} as const;

export const Modal = memo<ModalProps>(({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'medium',
}) => {
  // Мемоизируем обработчик клавиатуры
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Управление событиями клавиатуры
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Мемоизируем стили размера модального окна
  const sizeStyles = useMemo(() => MODAL_SIZES[size], [size]);

  // Мемоизируем стили карточки
  const cardStyles = useMemo(() => ({
    ...sizeStyles,
    ...MODAL_STYLES.card,
  }), [sizeStyles]);

  // Мемоизируем стили заголовка
  const titleStyles = useMemo(() => ({
    margin: 0,
  }), []);

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={MODAL_STYLES.backdrop}
    >
      <Card style={cardStyles}>
        <div style={{ padding: '20px' }}>
          <div style={MODAL_STYLES.header}>
            <Title id="modal-title" level="2" style={titleStyles}>
              {title}
            </Title>
            <Button 
              size="s" 
              mode="tertiary"
              onClick={onClose}
            >
              ×
            </Button>
          </div>
          
          <Div>
            {children}
          </Div>
          
          {actions && (
            <div style={MODAL_STYLES.actions}>
              {actions}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
});
