import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Div,
  Card,
  CardGrid,
  Title,
  Text,
  Button,
  Separator,
  FormItem,
  Input,
  Badge,
  Group,
  Header
} from '@vkontakte/vkui';
import { apiService } from '../services/api';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingScreen } from '../components/LoadingScreen';

interface NotificationTemplate {
  id: string;
  businessId: string;
  type: 'CONFIRM' | 'REMINDER' | 'CANCEL' | 'OTHER';
  channel: 'SMS' | 'EMAIL' | 'VK';
  subject?: string;
  message: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Стили
const TEMPLATES_STYLES = {
  headerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  } as const,
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as const,
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center' as const,
    color: 'var(--vkui--color_text_primary)',
  },
  templateCard: {
    padding: '16px',
  } as const,
  templateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  } as const,
  templateActions: {
    display: 'flex',
    gap: '8px',
  } as const,
  subjectText: {
    fontSize: '14px',
    color: 'var(--vkui--color_text_secondary)',
  } as const,
  messageText: {
    fontSize: '14px',
    fontStyle: 'italic',
  } as const,
  variablesLabel: {
    fontSize: '14px',
    color: 'var(--vkui--color_text_secondary)',
    marginBottom: '8px',
  } as const,
  variablesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  } as const,
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  } as const,
  selectStyle: {
    width: '100%',
    padding: '12px',
    border: '1px solid var(--vkui--color_border)',
    borderRadius: '8px',
    backgroundColor: 'var(--vkui--color_background)',
    color: 'var(--vkui--color_text_primary)',
    fontSize: '16px',
  } as const,
  textareaStyle: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    border: '1px solid var(--vkui--color_border)',
    borderRadius: '8px',
    resize: 'vertical',
    backgroundColor: 'var(--vkui--color_background)',
    color: 'var(--vkui--color_text_primary)',
    fontSize: '16px',
  } as const,
  variablesSection: {
    marginBottom: '16px',
  } as const,
  variablesLabelText: {
    fontSize: '14px',
    color: 'var(--vkui--color_text_secondary)',
    marginBottom: '8px',
  } as const,
  variablesButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  } as const,
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as const,
  checkboxStyle: {
    accentColor: 'var(--vkui--color_accent_blue)',
  } as const,
} as const;

export const NotificationTemplatesPage: React.FC = memo(() => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [availableVariables, setAvailableVariables] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);

  // Форма создания/редактирования шаблона
  const [formData, setFormData] = useState({
    type: 'CONFIRM' as 'CONFIRM' | 'REMINDER' | 'CANCEL' | 'OTHER',
    channel: 'SMS' as 'SMS' | 'EMAIL' | 'VK',
    subject: '',
    message: '',
    isActive: true,
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [templatesData, variablesData] = await Promise.all([
        apiService.getNotificationTemplates(businessId!),
        apiService.getAvailableVariables(businessId!),
      ]);
      setTemplates(templatesData);
      setAvailableVariables(variablesData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка загрузки шаблонов'
        : 'Ошибка загрузки шаблонов';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      loadData();
    }
  }, [businessId, loadData]);

  const handleCreateTemplate = useCallback(async () => {
    try {
      await apiService.createNotificationTemplate(businessId!, formData);
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка создания шаблона'
        : 'Ошибка создания шаблона';
      setError(errorMessage);
    }
  }, [businessId, formData, loadData]);

  const handleUpdateTemplate = useCallback(async () => {
    if (!selectedTemplate) return;
    
    try {
      await apiService.updateNotificationTemplate(businessId!, selectedTemplate.id, formData);
      setShowEditModal(false);
      setSelectedTemplate(null);
      resetForm();
      loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка обновления шаблона'
        : 'Ошибка обновления шаблона';
      setError(errorMessage);
    }
  }, [selectedTemplate, businessId, formData, loadData]);

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот шаблон?')) return;
    
    try {
      await apiService.deleteNotificationTemplate(businessId!, templateId);
      loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка удаления шаблона'
        : 'Ошибка удаления шаблона';
      setError(errorMessage);
    }
  }, [businessId, loadData]);

  const handleEditTemplate = useCallback((template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      type: template.type,
      channel: template.channel,
      subject: template.subject || '',
      message: template.message,
      isActive: template.isActive,
    });
    setShowEditModal(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      type: 'CONFIRM',
      channel: 'SMS',
      subject: '',
      message: '',
      isActive: true,
    });
  }, []);

  const getTypeText = useCallback((type: string) => {
    switch (type) {
      case 'CONFIRM': return 'Подтверждение';
      case 'REMINDER': return 'Напоминание';
      case 'CANCEL': return 'Отмена';
      case 'OTHER': return 'Прочее';
      default: return type;
    }
  }, []);

  const getChannelText = useCallback((channel: string) => {
    switch (channel) {
      case 'SMS': return '📱 SMS';
      case 'EMAIL': return '📧 Email';
      case 'VK': return '💬 VK';
      default: return channel;
    }
  }, []);

  const insertVariable = useCallback((variable: string) => {
    const placeholder = `{${variable}}`;
    setFormData({
      ...formData,
      message: formData.message + placeholder,
    });
  }, [formData]);

  const handleBack = useCallback(() => navigate(`/businesses/${businessId}`), [navigate, businessId]);
  const openCreateModal = useCallback(() => setShowCreateModal(true), []);
  const closeCreateModal = useCallback(() => setShowCreateModal(false), []);
  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedTemplate(null);
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
            <Button size="m" mode="primary" onClick={loadData}>
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
          <Title level="1">Шаблоны уведомлений</Title>
        </Header>
        <Div style={TEMPLATES_STYLES.headerActions}>
          <div style={TEMPLATES_STYLES.headerLeft}>
            <Button 
              size="s" 
              mode="tertiary"
              onClick={handleBack}
            >
              ← Назад
            </Button>
          </div>
          <Button size="m" mode="secondary" onClick={openCreateModal}>
            Создать шаблон
          </Button>
        </Div>
      </Group>

      {/* Список шаблонов */}
      {templates.length === 0 ? (
        <Group>
          <Div style={TEMPLATES_STYLES.emptyState}>
            <Text weight="2" style={{ fontSize: '48px', marginBottom: '16px' }}>📧</Text>
            <Text weight="2" style={{ fontSize: '20px', marginBottom: '8px' }}>У вас пока нет шаблонов уведомлений</Text>
            <Text style={{ marginBottom: '24px', color: 'var(--vkui--color_text_secondary)' }}>
              Создайте первый шаблон для начала работы
            </Text>
            <Button mode="secondary" onClick={openCreateModal}>
              Создать шаблон
            </Button>
          </Div>
        </Group>
      ) : (
        <CardGrid size="l">
          {templates.map((template) => (
            <Card key={template.id} style={{ marginBottom: '16px' }}>
              <div style={TEMPLATES_STYLES.templateCard}>
                <div style={TEMPLATES_STYLES.templateHeader}>
                  <div>
                    <Text weight="2" style={{ fontSize: '18px' }}>
                      {getTypeText(template.type)}
                    </Text>
                    <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                      {getChannelText(template.channel)}
                    </Text>
                  </div>
                  <div style={TEMPLATES_STYLES.templateActions}>
                    <StatusBadge 
                      status={template.isActive ? 'CONFIRMED' : 'CANCELLED'} 
                      type="notification"
                    />
                    <Button 
                      size="s" 
                      mode="tertiary"
                      onClick={() => handleEditTemplate(template)}
                    >
                      Изменить
                    </Button>
                    <Button 
                      size="s" 
                      mode="secondary"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>

                <Separator style={{ margin: '12px 0' }} />

                {template.subject && (
                  <div style={{ marginBottom: '8px' }}>
                    <Text style={TEMPLATES_STYLES.subjectText}>Тема:</Text>
                    <Text style={{ fontSize: '14px' }}>{template.subject}</Text>
                  </div>
                )}

                <div style={{ marginBottom: '12px' }}>
                  <Text style={TEMPLATES_STYLES.subjectText}>Сообщение:</Text>
                  <Text style={TEMPLATES_STYLES.messageText}>
                    {template.message}
                  </Text>
                </div>

                {template.variables.length > 0 && (
                  <div>
                    <Text style={TEMPLATES_STYLES.variablesLabel}>
                      Переменные:
                    </Text>
                    <div style={TEMPLATES_STYLES.variablesContainer}>
                      {template.variables.map(variable => (
                        <Badge key={variable} mode="prominent">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </CardGrid>
      )}

      {/* Модальное окно создания шаблона */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Создать шаблон уведомления"
        size="large"
        actions={
          <>
            <Button mode="secondary" onClick={closeCreateModal}>
              Отмена
            </Button>
            <Button 
              mode="primary" 
              onClick={handleCreateTemplate}
              disabled={!formData.message}
            >
              Создать шаблон
            </Button>
          </>
        }
      >
        <div style={TEMPLATES_STYLES.formGrid}>
          <FormItem top="Тип уведомления">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'CONFIRM' | 'REMINDER' | 'CANCEL' | 'OTHER' })}
              style={TEMPLATES_STYLES.selectStyle}
            >
              <option value="CONFIRM">Подтверждение</option>
              <option value="REMINDER">Напоминание</option>
              <option value="CANCEL">Отмена</option>
              <option value="OTHER">Прочее</option>
            </select>
          </FormItem>

          <FormItem top="Канал">
            <select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value as 'SMS' | 'EMAIL' | 'VK' })}
              style={TEMPLATES_STYLES.selectStyle}
            >
              <option value="SMS">📱 SMS</option>
              <option value="EMAIL">📧 Email</option>
              <option value="VK">💬 VK</option>
            </select>
          </FormItem>
        </div>

        {formData.channel === 'EMAIL' && (
          <FormItem top="Тема письма">
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Тема письма"
            />
          </FormItem>
        )}

        <FormItem top="Сообщение">
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Текст сообщения..."
            style={TEMPLATES_STYLES.textareaStyle}
          />
        </FormItem>

        <div style={TEMPLATES_STYLES.variablesSection}>
          <Text style={TEMPLATES_STYLES.variablesLabelText}>
            Доступные переменные:
          </Text>
          <div style={TEMPLATES_STYLES.variablesButtons}>
            {Object.entries(availableVariables).map(([key, description]) => (
              <Button
                key={key}
                size="s"
                mode="secondary"
                onClick={() => insertVariable(key)}
                title={description}
              >
                {key}
              </Button>
            ))}
          </div>
        </div>

        <div style={TEMPLATES_STYLES.checkboxContainer}>
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            style={TEMPLATES_STYLES.checkboxStyle}
          />
          <Text>Активный шаблон</Text>
        </div>
      </Modal>

      {/* Модальное окно редактирования шаблона */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Редактировать шаблон уведомления"
        size="large"
        actions={
          <>
            <Button mode="secondary" onClick={closeEditModal}>
              Отмена
            </Button>
            <Button 
              mode="primary" 
              onClick={handleUpdateTemplate}
              disabled={!formData.message}
            >
              Сохранить изменения
            </Button>
          </>
        }
      >
        <div style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '14px', color: 'var(--vkui--color_text_secondary)' }}>
            Тип: {getTypeText(formData.type)} • Канал: {getChannelText(formData.channel)}
          </Text>
        </div>

        {formData.channel === 'EMAIL' && (
          <FormItem top="Тема письма">
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Тема письма"
            />
          </FormItem>
        )}

        <FormItem top="Сообщение">
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Текст сообщения..."
            style={TEMPLATES_STYLES.textareaStyle}
          />
        </FormItem>

        <div style={TEMPLATES_STYLES.variablesSection}>
          <Text style={TEMPLATES_STYLES.variablesLabelText}>
            Доступные переменные:
          </Text>
          <div style={TEMPLATES_STYLES.variablesButtons}>
            {Object.entries(availableVariables).map(([key, description]) => (
              <Button
                key={key}
                size="s"
                mode="secondary"
                onClick={() => insertVariable(key)}
                title={description}
              >
                {key}
              </Button>
            ))}
          </div>
        </div>

        <div style={TEMPLATES_STYLES.checkboxContainer}>
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            style={TEMPLATES_STYLES.checkboxStyle}
          />
          <Text>Активный шаблон</Text>
        </div>
      </Modal>
    </div>
  );
});
