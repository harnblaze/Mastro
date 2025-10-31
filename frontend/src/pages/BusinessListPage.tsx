import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Business } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { VkBridgeDemo } from '../components/VkBridgeDemo';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';
import { 
  Button, 
  Card as VKCard, 
  Div, 
  Text, 
  Group, 
  Header, 
  SimpleCell,
  Avatar,
  FormItem,
  Input
} from '@vkontakte/vkui';
import { LoadingScreen } from '../components/LoadingScreen';

// Стили
const BUSINESS_STYLES = {
  headerActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  } as const,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  } as const,
  emptyCard: {
    textAlign: 'center' as const,
    padding: '40px 20px',
  } as const,
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid var(--vkui--color_border)',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: 'var(--vkui--color_background)',
    color: 'var(--vkui--color_text_primary)',
  } as const,
  textarea: {
    width: '100%',
    minHeight: '80px',
    padding: '12px',
    border: '1px solid var(--vkui--color_border)',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: 'var(--vkui--color_background)',
    color: 'var(--vkui--color_text_primary)',
    resize: 'vertical' as const,
  } as const,
} as const;

export const BusinessListPage: React.FC = memo(() => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Форма создания бизнеса
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    timezone: 'Europe/Moscow',
    phone: '',
    email: '',
    website: '',
    description: '',
  });

  const loadBusinesses = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getBusinesses();
      setBusinesses(data);
    } catch {
      setError('Не удалось загрузить список бизнесов');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleCreateBusiness = useCallback(async () => {
    try {
      setIsCreating(true);
      const newBusiness = await apiService.createBusiness(formData);
      setShowCreateModal(false);
      resetForm();
      loadBusinesses();
      // Переходим к созданному бизнесу
      navigate(`/businesses/${newBusiness.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка создания бизнеса');
    } finally {
      setIsCreating(false);
    }
  }, [formData, loadBusinesses, navigate]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      address: '',
      timezone: 'Europe/Moscow',
      phone: '',
      email: '',
      website: '',
      description: '',
    });
  }, []);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    logout();
    setShowLogoutModal(false);
  }, [logout]);

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
            <Button mode="primary" onClick={loadBusinesses}>
              Повторить
            </Button>
          </Div>
        </Group>
      </div>
    );
  }

  return (
    <div>
      {/* Заголовок страницы */}
      <Group>
        <Header>
          <Text weight="2" style={{ fontSize: '24px' }}>
            Добро пожаловать, {user?.email?.split('@')[0]}! 👋
          </Text>
        </Header>
        <Div>
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            Управляйте своими бизнесами и записями клиентов
          </Text>
        </Div>
        <Div style={BUSINESS_STYLES.headerActions}>
          <Button
            mode="secondary"
            size="m"
            onClick={() => setShowCreateModal(true)}
          >
            Создать бизнес
          </Button>
          <Button
            mode="tertiary"
            appearance="negative"
            size="m"
            onClick={handleLogoutClick}
          >
            Выйти
          </Button>
        </Div>
      </Group>

      {/* VK Bridge Demo */}
      <Group>
        <VKCard>
          <VkBridgeDemo />
        </VKCard>
      </Group>

      {businesses.length === 0 ? (
        <Group>
          <VKCard>
            <Div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Text weight="2" style={{ fontSize: '48px', marginBottom: '16px' }}>
                🏢
              </Text>
              <Text weight="2" style={{ fontSize: '20px', marginBottom: '8px' }}>
                Создайте свой первый бизнес
              </Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: '24px' }}>
                Начните принимать записи от клиентов и управляйте своим расписанием
              </Text>
              <Button
                mode="primary"
                size="m"
                onClick={() => setShowCreateModal(true)}
              >
                Создать первый бизнес
              </Button>
            </Div>
          </VKCard>
        </Group>
      ) : (
        <Group>
          <div style={BUSINESS_STYLES.grid}>
            {businesses.map((business) => (
              <VKCard key={business.id} mode="outline">
                <SimpleCell
                  before={<Avatar size={40}>🏢</Avatar>}
                  after={
                    <Button
                      mode="tertiary"
                      size="m"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/businesses/${business.id}`);
                      }}
                    >
                      Открыть
                    </Button>
                  }
                  onClick={() => navigate(`/businesses/${business.id}`)}
                >
                  <div>
                    <Text weight="2" style={{ fontSize: '16px' }}>
                      {business.name}
                    </Text>
                    <Text style={{ 
                      color: 'var(--vkui--color_text_secondary)', 
                      fontSize: '14px' 
                    }}>
                      {business.address || 'Адрес не указан'}
                    </Text>
                  </div>
                </SimpleCell>
              </VKCard>
            ))}
          </div>
        </Group>
      )}

      {/* Форма создания бизнеса */}
      {showCreateModal && (
        <Group>
          <VKCard mode="outline">
            <Group>
              <Header>
                <Text weight="2">Создать новый бизнес</Text>
              </Header>
              <Div>
                <FormItem top="Название бизнеса *">
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Например: Салон красоты 'Элегант'"
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
                      type="tel"
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
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </FormItem>

                <FormItem top="Часовой пояс">
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    style={BUSINESS_STYLES.select}
                  >
                    <option value="Europe/Moscow">Москва (UTC+3)</option>
                    <option value="Europe/Kiev">Киев (UTC+2)</option>
                    <option value="Europe/Minsk">Минск (UTC+3)</option>
                    <option value="Asia/Almaty">Алматы (UTC+6)</option>
                    <option value="Asia/Tashkent">Ташкент (UTC+5)</option>
                  </select>
                </FormItem>

                <FormItem top="Описание">
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Краткое описание вашего бизнеса"
                    style={BUSINESS_STYLES.textarea}
                  />
                </FormItem>

                <Div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <Button 
                    mode="secondary" 
                    size="m"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    mode="primary" 
                    size="m"
                    onClick={handleCreateBusiness}
                    disabled={!formData.name || isCreating}
                  >
                    {isCreating ? 'Создание...' : 'Создать бизнес'}
                  </Button>
                </Div>
              </Div>
            </Group>
          </VKCard>
        </Group>
      )}

      {/* Модальное окно подтверждения выхода */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
});
