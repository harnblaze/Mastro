import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Div, Card, Title, Text, Button, FormItem, Input, Group, Header } from '@vkontakte/vkui';
import { apiService } from '../services/api';
import { Modal } from '../components/Modal';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorScreen } from '../components/ErrorScreen';

// Стили
const AVAILABILITY_STYLES = {
  headerBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
  } as const,
  headerLeft: {
    display: 'flex', alignItems: 'center', gap: '12px',
  } as const,
  actions: {
    display: 'flex', gap: '8px',
  } as const,
  dateGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px',
  } as const,
  slotCard: {
    padding: '8px', color: '#FFFFFF', borderRadius: '4px', textAlign: 'center', fontSize: '12px',
  } as const,
  legendRow: {
    display: 'flex', gap: '16px', flexWrap: 'wrap',
  } as const,
  select: {
    width: '100%', padding: '12px', border: '1px solid var(--vkui--color_border)', borderRadius: '8px',
    backgroundColor: 'var(--vkui--color_background)', color: 'var(--vkui--color_text_primary)', fontSize: '16px',
  } as const,
} as const;

interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
}

interface DayAvailability {
  date: string;
  slots: AvailabilitySlot[];
  isWorkingDay: boolean;
  workingHours?: {
    start: string;
    end: string;
  };
}

interface AvailabilityException {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'CLOSED' | 'OPEN_CUSTOM';
  reason?: string;
}

export const AvailabilityPage: React.FC = memo(() => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCreateExceptionModal, setShowCreateExceptionModal] = useState(false);
  const [showExceptionsModal, setShowExceptionsModal] = useState(false);

  // Форма создания исключения
  const [exceptionForm, setExceptionForm] = useState({
    date: selectedDate,
    startTime: '',
    endTime: '',
    type: 'CLOSED' as 'CLOSED' | 'OPEN_CUSTOM',
    reason: '',
  });

  const loadAvailability = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAvailability(businessId!, {
        date: selectedDate,
      });
      setAvailability(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка загрузки доступности'
        : 'Ошибка загрузки доступности';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, selectedDate]);

  const loadExceptions = useCallback(async () => {
    try {
      const data = await apiService.getAvailabilityExceptions(businessId!, {
        from: selectedDate,
        to: selectedDate,
      });
      setExceptions(data);
    } catch (err: unknown) {
      console.error('Ошибка загрузки исключений:', err);
    }
  }, [businessId, selectedDate]);

  useEffect(() => {
    if (businessId) {
      loadAvailability();
      loadExceptions();
    }
  }, [businessId, selectedDate, loadAvailability, loadExceptions]);

  const resetExceptionForm = useCallback(() => {
    setExceptionForm({
      date: selectedDate,
      startTime: '',
      endTime: '',
      type: 'CLOSED',
      reason: '',
    });
  }, [selectedDate]);

  const handleCreateException = useCallback(async () => {
    if (isSubmitting) return;

    // Простая валидация для особых часов
    if (exceptionForm.type === 'OPEN_CUSTOM') {
      if (!exceptionForm.startTime || !exceptionForm.endTime) {
        setError('Укажите время начала и окончания для особых часов');
        return;
      }
      if (exceptionForm.startTime >= exceptionForm.endTime) {
        setError('Время начала должно быть раньше времени окончания');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await apiService.createAvailabilityException(businessId!, exceptionForm);
      setShowCreateExceptionModal(false);
      resetExceptionForm();
      loadAvailability();
      loadExceptions();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка создания исключения'
        : 'Ошибка создания исключения';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [businessId, exceptionForm, isSubmitting, resetExceptionForm, loadAvailability, loadExceptions]);

  const handleDeleteException = useCallback(async (exceptionId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это исключение?')) return;

    try {
      await apiService.deleteAvailabilityException(exceptionId);
      loadAvailability();
      loadExceptions();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка удаления исключения'
        : 'Ошибка удаления исключения';
      setError(errorMessage);
    }
  }, [loadAvailability, loadExceptions]);

  // отображение слотов вынесено в компонент

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={loadAvailability} />;
  }

  return (
    <div>
      {/* Заголовок */}
      <Group>
        <Header>
          <Title level="1">Управление доступностью</Title>
        </Header>
        <Div style={AVAILABILITY_STYLES.headerBar}>
          <div style={AVAILABILITY_STYLES.headerLeft}>
            <Button
              size="s"
              mode="tertiary"
              onClick={() => navigate(`/businesses/${businessId}`)}
            >
              ← Назад
            </Button>
          </div>
          <div style={AVAILABILITY_STYLES.actions}>
            <Button
              size="m"
              mode="secondary"
              onClick={() => setShowExceptionsModal(true)}
            >
              Исключения
            </Button>
            <Button
              size="m"
              mode="primary"
              onClick={() => { setError(''); setShowCreateExceptionModal(true); }}
            >
              Добавить исключение
            </Button>
          </div>
        </Div>
      </Group>

      {/* Выбор даты */}
      <Card style={{ marginBottom: '20px' }}>
        <Div>
          <FormItem top="Выберите дату">
            <Input
              type="date"
              value={selectedDate}
            onChange={(e) => { setError(''); setSelectedDate(e.target.value); }}
            />
          </FormItem>
        </Div>
      </Card>

      {/* Информация о дне */}
      {availability && (
        <Card style={{ marginBottom: '20px' }}>
          <Div>
            <Title level="2" style={{ marginBottom: '16px' }}>
              Доступность на {new Date(availability.date).toLocaleDateString('ru-RU')}
            </Title>

            {!availability.isWorkingDay ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '18px' }}>
                  Выходной день
                </Text>
              </div>
            ) : (
              <div>
                {availability.workingHours && (
                  <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: '16px' }}>
                    Рабочие часы: {availability.workingHours.start} - {availability.workingHours.end}
                  </Text>
                )}

                <div style={AVAILABILITY_STYLES.dateGrid}>
                  {availability.slots.map((slot, index) => (
                    <div
                      key={index}
                      style={{
                        ...AVAILABILITY_STYLES.slotCard,
                        backgroundColor: !slot.isAvailable ? (slot.reason === 'Занято' ? '#F44336' : '#FFA500') : '#4CAF50',
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div>
                        {slot.isAvailable ? 'Доступно' : (slot.reason || 'Недоступно')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Div>
        </Card>
      )}

      {/* Легенда */}
      <Card>
        <Div>
          <Title level="3" style={{ marginBottom: '12px' }}>Легенда</Title>
          <div style={AVAILABILITY_STYLES.legendRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#4CAF50', borderRadius: '2px' }}></div>
              <Text style={{ fontSize: '14px' }}>Доступно</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#F44336', borderRadius: '2px' }}></div>
              <Text style={{ fontSize: '14px' }}>Занято</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#FFA500', borderRadius: '2px' }}></div>
              <Text style={{ fontSize: '14px' }}>Исключение</Text>
            </div>
          </div>
        </Div>
      </Card>

      {/* Модальное окно создания исключения */}
      <Modal
        isOpen={showCreateExceptionModal}
        onClose={() => setShowCreateExceptionModal(false)}
        title="Добавить исключение"
        actions={
          <>
            <Button mode="secondary" onClick={() => setShowCreateExceptionModal(false)}>
              Отмена
            </Button>
            <Button mode="primary" onClick={handleCreateException} disabled={isSubmitting}>
              Создать исключение
            </Button>
          </>
        }
      >
        <FormItem top="Дата">
          <Input
            type="date"
            value={exceptionForm.date}
            onChange={(e) => setExceptionForm({ ...exceptionForm, date: e.target.value })}
          />
        </FormItem>

        <FormItem top="Тип исключения">
          <select
            value={exceptionForm.type}
            onChange={(e) => setExceptionForm({ ...exceptionForm, type: e.target.value as 'CLOSED' | 'OPEN_CUSTOM' })}
            style={AVAILABILITY_STYLES.select}
          >
            <option value="CLOSED">Выходной день</option>
            <option value="OPEN_CUSTOM">Особые часы работы</option>
          </select>
        </FormItem>

        {exceptionForm.type === 'OPEN_CUSTOM' && (
          <>
            <FormItem top="Время начала">
              <Input
                type="time"
                value={exceptionForm.startTime}
                onChange={(e) => setExceptionForm({ ...exceptionForm, startTime: e.target.value })}
              />
            </FormItem>

            <FormItem top="Время окончания">
              <Input
                type="time"
                value={exceptionForm.endTime}
                onChange={(e) => setExceptionForm({ ...exceptionForm, endTime: e.target.value })}
              />
            </FormItem>
          </>
        )}

        <FormItem top="Причина (необязательно)">
          <Input
            value={exceptionForm.reason}
            onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
            placeholder="Например: Праздник, техническое обслуживание"
          />
        </FormItem>
      </Modal>

      {/* Модальное окно исключений */}
      <Modal
        isOpen={showExceptionsModal}
        onClose={() => setShowExceptionsModal(false)}
        title="Исключения доступности"
        size="large"
      >
        {exceptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
              Исключений для выбранной даты нет
            </Text>
          </div>
        ) : (
          <div>
            {exceptions.map((exception) => (
              <Card key={exception.id} style={{ marginBottom: '12px' }}>
                <Div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text weight="2">
                        {exception.type === 'CLOSED' ? 'Выходной день' : 'Особые часы'}
                      </Text>
                      <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                        {new Date(exception.date).toLocaleDateString('ru-RU')}
                      </Text>
                      {exception.startTime && exception.endTime && (
                        <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                          Время: {exception.startTime} - {exception.endTime}
                        </Text>
                      )}
                      {exception.reason && (
                        <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                          Причина: {exception.reason}
                        </Text>
                      )}
                    </div>
                    <Button
                      size="s"
                      mode="secondary"
                      onClick={() => handleDeleteException(exception.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </Div>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
});
