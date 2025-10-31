import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Div,
  Card,
  Title,
  Text,
  Button,
  Separator,
  FormItem,
  Input,
  Tabs,
  TabsItem,
  Group,
  Header
} from '@vkontakte/vkui';
import type { Business } from '../types';
import { apiService } from '../services/api';
import { Modal } from '../components/Modal';
import { LoadingScreen } from '../components/LoadingScreen';

// Стили
const SETTINGS_STYLES = {
  headerBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
  } as const,
  headerLeft: {
    display: 'flex', alignItems: 'center', gap: '12px',
  } as const,
  timezoneSelect: {
    width: '100%', padding: '12px', border: '1px solid var(--vkui--color_border)', borderRadius: '8px',
    backgroundColor: 'var(--vkui--color_background)', color: 'var(--vkui--color_text_primary)', fontSize: '16px',
  } as const,
  workingHoursRow: {
    display: 'flex', alignItems: 'center', gap: '16px', padding: '12px',
    border: '1px solid var(--vkui--color_border)', borderRadius: '8px', backgroundColor: 'var(--vkui--color_background_secondary)'
  } as const,
  remindersWrap: {
    display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center',
  } as const,
} as const;

export const SettingsPage: React.FC = memo(() => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'working-hours' | 'notifications'>('general');

  // Форма настроек бизнеса
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    timezone: 'Europe/Moscow',
    phone: '',
    email: '',
    website: '',
    description: '',
    workingHours: {
      monday: { start: '09:00', end: '18:00', isWorking: true },
      tuesday: { start: '09:00', end: '18:00', isWorking: true },
      wednesday: { start: '09:00', end: '18:00', isWorking: true },
      thursday: { start: '09:00', end: '18:00', isWorking: true },
      friday: { start: '09:00', end: '18:00', isWorking: true },
      saturday: { start: '10:00', end: '16:00', isWorking: true },
      sunday: { start: '10:00', end: '16:00', isWorking: false },
    },
    notificationSettings: {
      smsEnabled: true,
      emailEnabled: true,
      vkEnabled: true,
      reminderHours: [24, 2], // За 24 часа и за 2 часа
      confirmationTemplate: 'Ваша запись подтверждена на {date} в {time}. Ждем вас!',
      reminderTemplate: 'Напоминаем о записи завтра в {time}. До встречи!',
      cancellationTemplate: 'Ваша запись на {date} в {time} отменена. Свяжитесь с нами для переноса.',
    },
  });

  const loadBusiness = useCallback(async () => {
    try {
      setIsLoading(true);
      const businessData = await apiService.getBusiness(businessId!);
      setBusiness(businessData);
      setFormData(prevFormData => ({
        name: businessData.name || '',
        address: businessData.address || '',
        timezone: businessData.timezone || 'Europe/Moscow',
        phone: businessData.phone || '',
        email: businessData.email || '',
        website: businessData.website || '',
        description: businessData.description || '',
        workingHours: businessData.workingHours || prevFormData.workingHours,
        notificationSettings: prevFormData.notificationSettings,
      }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка загрузки настроек'
        : 'Ошибка загрузки настроек';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      loadBusiness();
    }
  }, [businessId, loadBusiness]);

  const handleSaveSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      const { notificationSettings, ...businessData } = formData;
      await apiService.updateBusiness(businessId!, businessData);
      setBusiness({ ...business!, ...businessData });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка сохранения настроек'
        : 'Ошибка сохранения настроек';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [business, businessId, formData]);

  const handleWorkingHoursChange = useCallback((day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day as keyof typeof prev.workingHours],
          [field]: value,
        },
      },
    }));
  }, []);

  const handleNotificationSettingChange = useCallback((field: string, value: string | boolean | string[] | number[]) => {
    setFormData(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [field]: value,
      },
    }));
  }, []);

  const handleReminderHourChange = useCallback((index: number, value: number) => {
    setFormData(prev => {
      const newReminderHours = [...prev.notificationSettings.reminderHours];
      newReminderHours[index] = value;
      return {
        ...prev,
        notificationSettings: { ...prev.notificationSettings, reminderHours: newReminderHours },
      };
    });
  }, []);

  const addReminderHour = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        reminderHours: [...prev.notificationSettings.reminderHours, 1],
      },
    }));
  }, []);

  const removeReminderHour = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        reminderHours: prev.notificationSettings.reminderHours.filter((_, i) => i !== index),
      },
    }));
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div>
        <Group>
          <Div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
            color: 'var(--vkui--color_text_primary)',
          }}>
            <Text weight="2" style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</Text>
            <Text weight="2" style={{ fontSize: '20px', marginBottom: '8px' }}>Ошибка загрузки</Text>
            <Text style={{ marginBottom: '24px' }}>{error}</Text>
            <Button size="m" mode="primary" onClick={loadBusiness}>
              Повторить
            </Button>
          </Div>
        </Group>
      </div>
    );
  }

  return (
    <div>
      {/* Заголовок */}
      <Group>
        <Header>
          <Title level="1">Настройки бизнеса</Title>
        </Header>
        <Div style={SETTINGS_STYLES.headerBar}>
          <div style={SETTINGS_STYLES.headerLeft}>
            <Button 
              size="s" 
              mode="tertiary"
              onClick={() => navigate(`/businesses/${businessId}`)}
            >
              ← Назад
            </Button>
          </div>
          <Button 
            size="m" 
            mode="primary"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Div>
      </Group>

      {/* Табы */}
      <Tabs>
        <TabsItem
          selected={activeTab === 'general'}
          onClick={() => setActiveTab('general')}
        >
          Общие
        </TabsItem>
        <TabsItem
          selected={activeTab === 'working-hours'}
          onClick={() => setActiveTab('working-hours')}
        >
          Рабочие часы
        </TabsItem>
        <TabsItem
          selected={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
        >
          Уведомления
        </TabsItem>
      </Tabs>

      {/* Общие настройки */}
      {activeTab === 'general' && (
        <Card>
          <Div>
            <Title level="2" style={{ marginBottom: '20px' }}>Общая информация</Title>
            
            <FormItem top="Название бизнеса *">
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Название вашего салона или студии"
                required
              />
            </FormItem>

            <FormItem top="Адрес">
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Адрес вашего бизнеса"
              />
            </FormItem>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormItem top="Телефон">
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (999) 123-45-67"
                />
              </FormItem>

              <FormItem top="Email">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </FormItem>
            </div>

            <FormItem top="Веб-сайт">
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </FormItem>

            <FormItem top="Часовой пояс">
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                style={SETTINGS_STYLES.timezoneSelect}
              >
                <option value="Europe/Moscow">Москва (UTC+3)</option>
                <option value="Europe/Kiev">Киев (UTC+2)</option>
                <option value="Europe/Minsk">Минск (UTC+3)</option>
                <option value="Asia/Almaty">Алматы (UTC+6)</option>
                <option value="Asia/Tashkent">Ташкент (UTC+5)</option>
              </select>
            </FormItem>

            <FormItem top="Описание">
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание вашего бизнеса"
              />
            </FormItem>
          </Div>
        </Card>
      )}

      {/* Рабочие часы */}
      {activeTab === 'working-hours' && (
        <Card>
          <Div>
            <Title level="2" style={{ marginBottom: '20px' }}>Рабочие часы</Title>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              {Object.entries(formData.workingHours).map(([day, hours]) => (
                <div key={day} style={SETTINGS_STYLES.workingHoursRow}>
                  <input
                    type="checkbox"
                    checked={hours.isWorking}
                    onChange={(e) => handleWorkingHoursChange(day, 'isWorking', e.target.checked)}
                    style={{
                      accentColor: 'var(--vkui--color_accent_blue)'
                    }}
                  />
                  <Text style={{ minWidth: '100px', fontWeight: 'bold' }}>
                    {day === 'monday' ? 'Понедельник' :
                     day === 'tuesday' ? 'Вторник' :
                     day === 'wednesday' ? 'Среда' :
                     day === 'thursday' ? 'Четверг' :
                     day === 'friday' ? 'Пятница' :
                     day === 'saturday' ? 'Суббота' : 'Воскресенье'}
                  </Text>
                  <Input
                    type="time"
                    value={hours.start}
                    onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                    disabled={!hours.isWorking}
                    style={{ width: '120px' }}
                  />
                  <Text>-</Text>
                  <Input
                    type="time"
                    value={hours.end}
                    onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                    disabled={!hours.isWorking}
                    style={{ width: '120px' }}
                  />
                  {!hours.isWorking && (
                    <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                      Выходной
                    </Text>
                  )}
                </div>
              ))}
            </div>
          </Div>
        </Card>
      )}

      {/* Настройки уведомлений */}
      {activeTab === 'notifications' && (
        <Card>
          <Div>
            <Title level="2" style={{ marginBottom: '20px' }}>Настройки уведомлений</Title>
            
            <div style={{ marginBottom: '24px' }}>
              <Text weight="2" style={{ marginBottom: '12px' }}>Каналы уведомлений</Text>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={formData.notificationSettings.smsEnabled}
                    onChange={(e) => handleNotificationSettingChange('smsEnabled', e.target.checked)}
                    style={{
                      accentColor: 'var(--vkui--color_accent_blue)'
                    }}
                  />
                  <Text>📱 SMS уведомления</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={formData.notificationSettings.emailEnabled}
                    onChange={(e) => handleNotificationSettingChange('emailEnabled', e.target.checked)}
                    style={{
                      accentColor: 'var(--vkui--color_accent_blue)'
                    }}
                  />
                  <Text>📧 Email уведомления</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={formData.notificationSettings.vkEnabled}
                    onChange={(e) => handleNotificationSettingChange('vkEnabled', e.target.checked)}
                    style={{
                      accentColor: 'var(--vkui--color_accent_blue)'
                    }}
                  />
                  <Text>💬 VK уведомления</Text>
                </div>
              </div>
            </div>

            <Separator style={{ margin: '20px 0' }} />

            <div style={{ marginBottom: '24px' }}>
              <Text weight="2" style={{ marginBottom: '12px' }}>Напоминания</Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px', marginBottom: '12px' }}>
                За сколько часов до записи отправлять напоминание
              </Text>
              <div style={SETTINGS_STYLES.remindersWrap}>
                {formData.notificationSettings.reminderHours.map((hour, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Input
                      type="number"
                      value={hour}
                      onChange={(e) => handleReminderHourChange(index, parseInt(e.target.value) || 0)}
                      style={{ width: '80px' }}
                    />
                    <Text>часов</Text>
                    {formData.notificationSettings.reminderHours.length > 1 && (
                      <Button
                        size="s"
                        mode="secondary"
                        onClick={() => removeReminderHour(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button size="s" mode="secondary" onClick={addReminderHour}>
                  + Добавить
                </Button>
              </div>
            </div>

            <Separator style={{ margin: '20px 0' }} />

            <div style={{ marginBottom: '24px' }}>
              <Text weight="2" style={{ marginBottom: '12px' }}>Шаблоны сообщений</Text>
              
              <FormItem top="Подтверждение записи">
                <Input
                  value={formData.notificationSettings.confirmationTemplate}
                  onChange={(e) => handleNotificationSettingChange('confirmationTemplate', e.target.value)}
                  placeholder="Ваша запись подтверждена на {date} в {time}. Ждем вас!"
                />
              </FormItem>

              <FormItem top="Напоминание">
                <Input
                  value={formData.notificationSettings.reminderTemplate}
                  onChange={(e) => handleNotificationSettingChange('reminderTemplate', e.target.value)}
                  placeholder="Напоминаем о записи завтра в {time}. До встречи!"
                />
              </FormItem>

              <FormItem top="Отмена записи">
                <Input
                  value={formData.notificationSettings.cancellationTemplate}
                  onChange={(e) => handleNotificationSettingChange('cancellationTemplate', e.target.value)}
                  placeholder="Ваша запись на {date} в {time} отменена. Свяжитесь с нами для переноса."
                />
              </FormItem>

              <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '12px', marginTop: '8px' }}>
                Используйте переменные: {'{date}'}, {'{time}'}, {'{service}'}, {'{client}'}
              </Text>
            </div>
          </Div>
        </Card>
      )}
    </div>
  );
});
