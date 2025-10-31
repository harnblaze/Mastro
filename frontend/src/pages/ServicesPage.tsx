import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Title, 
  Div, 
  Text, 
  Group, 
  Header, 
  Card as VKCard,
  FormItem,
  Input
} from '@vkontakte/vkui';
import type { Service } from '../types';
import { apiService } from '../services/api';
import { Modal } from '../components/Modal';
import { LoadingScreen } from '../components/LoadingScreen';

// Стили
const SERVICES_STYLES = {
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
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '16px',
  } as const,
  serviceCard: {
    padding: '20px',
  } as const,
  serviceHeader: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '8px',
  } as const,
  serviceTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as const,
  serviceIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px',
    flexShrink: 0,
  } as const,
  serviceActions: {
    display: 'flex',
    gap: '8px',
  } as const,
  separator: {
    height: '1px',
    backgroundColor: 'var(--vkui--color_border)',
    margin: '16px 0',
  } as const,
  serviceDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px',
  } as const,
  detailLabel: {
    fontSize: '14px',
    color: 'var(--vkui--color_text_secondary)',
    margin: 0,
    marginBottom: '4px',
  } as const,
  detailValue: {
    fontSize: '16px',
    fontWeight: 'semibold',
    color: 'var(--vkui--color_text_primary)',
    margin: 0,
  } as const,
  priceValue: {
    fontSize: '16px',
    fontWeight: 'semibold',
    color: 'var(--vkui--color_accent_green)',
    margin: 0,
  } as const,
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  } as const,
  colorInput: {
    width: '100%',
    height: '40px',
    border: '1px solid var(--vkui--color_border)',
    borderRadius: '8px',
  } as const,
} as const;

export const ServicesPage: React.FC = memo(() => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Форма создания/редактирования услуги
  const [formData, setFormData] = useState({
    title: '',
    durationMinutes: 60,
    price: 0,
    bufferBefore: 0,
    bufferAfter: 0,
    color: '#0077FF',
  });

  const loadServices = useCallback(async () => {
    if (!businessId) return;
    
    try {
      setIsLoading(true);
      const servicesData = await apiService.getServices(businessId);
      setServices(servicesData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки услуг');
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      loadServices();
    }
  }, [businessId, loadServices]);

  const handleCreateService = useCallback(async () => {
    if (!businessId) return;
    
    try {
      await apiService.createService(businessId, formData);
      setShowCreateModal(false);
      resetForm();
      loadServices();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка создания услуги');
    }
  }, [businessId, formData, loadServices]);

  const handleUpdateService = useCallback(async () => {
    if (!selectedService) return;
    
    try {
      await apiService.updateService(businessId!, selectedService.id, formData);
      setShowEditModal(false);
      setSelectedService(null);
      resetForm();
      loadServices();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления услуги');
    }
  }, [selectedService, businessId, formData, loadServices]);

  const handleDeleteService = useCallback(async (serviceId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) return;
    
    try {
      await apiService.deleteService(businessId!, serviceId);
      loadServices();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления услуги');
    }
  }, [businessId, loadServices]);

  const handleEditService = useCallback((service: Service) => {
    setSelectedService(service);
    setFormData({
      title: service.title,
      durationMinutes: service.durationMinutes,
      price: service.price,
      bufferBefore: service.bufferBefore || 0,
      bufferAfter: service.bufferAfter || 0,
      color: service.color || '#0077FF',
    });
    setShowEditModal(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      durationMinutes: 60,
      price: 0,
      bufferBefore: 0,
      bufferAfter: 0,
      color: '#0077FF',
    });
  }, []);

  const formatPrice = useCallback((price: number) => {
    return `${price.toLocaleString()} ₽`;
  }, []);

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  }, []);

  const handleBack = useCallback(() => navigate(`/businesses/${businessId}`), [navigate, businessId]);
  const openCreateModal = useCallback(() => setShowCreateModal(true), []);
  const closeCreateModal = useCallback(() => setShowCreateModal(false), []);
  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedService(null);
  }, []);

  const filteredServices = useMemo(() => 
    services.filter(service =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase())
    ), [services, searchQuery]
  );

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
            <Button size="m" mode="primary" onClick={loadServices}>
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
      <Title level="1">Управление услугами</Title>
        </Header>
        <Div style={SERVICES_STYLES.headerActions}>
        <div style={SERVICES_STYLES.headerLeft}>
        <Button 
            size="s" 
            mode="tertiary"
            onClick={handleBack}
          >
            ← Назад
          </Button>
        </div>
        <Button size="m" mode='secondary' onClick={openCreateModal}>
          Добавить услугу
        </Button>
        </Div>
      </Group>

      {/* Поиск */}
      <Group>
        <VKCard mode="outline">
          <Group>
            <Header>
              <Text weight="2">Поиск услуг</Text>
            </Header>
            <Div>
              <FormItem top="Введите название услуги...">
                <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите название услуги..."
                />
              </FormItem>
            </Div>
          </Group>
        </VKCard>
      </Group>

      {/* Список услуг */}
      {filteredServices.length === 0 ? (
        <Group>
          <VKCard mode="outline">
            <Group>
              <Header>
                <Text weight="2">{searchQuery ? 'Услуги не найдены' : 'У вас пока нет услуг'}</Text>
              </Header>
              <Div>
                <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: '16px' }}>
                  {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первую услугу для начала работы'}
                </Text>
            <Button mode="secondary" onClick={openCreateModal}>
              Добавить услугу
            </Button>
              </Div>
            </Group>
          </VKCard>
        </Group>
      ) : (
        <Group>
        <div style={SERVICES_STYLES.servicesGrid}>
          {filteredServices.map((service) => (
              <VKCard key={service.id} mode="outline">
                <Group>
                  <Div style={SERVICES_STYLES.serviceCard}>
                <div style={SERVICES_STYLES.serviceHeader}>
                      <div style={SERVICES_STYLES.serviceTitleRow}>
                    <div
                      style={{
                        ...SERVICES_STYLES.serviceIcon,
                        backgroundColor: service.color || 'var(--vkui--color_accent_blue)',
                      }}
                    >
                      {service.title.charAt(0)}
                    </div>
                    <div>
                          <Text weight="2" style={{ 
                            fontSize: '18px',
                        margin: 0,
                            marginBottom: '4px'
                      }}>
                        {service.title}
                          </Text>
                    </div>
                  </div>
                      <div style={SERVICES_STYLES.serviceActions}>
                    <Button 
                      mode="secondary"
                      size="s"
                      onClick={() => handleEditService(service)}
                    >
                      Изменить
                    </Button>
                    <Button
                      mode="secondary"
                      appearance="negative"
                      size="s"
                      onClick={() => handleDeleteService(service.id)}
                          style={{ color: 'var(--vkui--color_accent_red)', borderColor: 'var(--vkui--color_accent_red)' }}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
                
                <div style={SERVICES_STYLES.separator} />
                
                <div style={SERVICES_STYLES.serviceDetailsGrid}>
                  <div>
                        <Text style={SERVICES_STYLES.detailLabel}>
                      Длительность
                        </Text>
                        <Text style={SERVICES_STYLES.detailValue}>
                      {formatDuration(service.durationMinutes)}
                        </Text>
                  </div>
                  <div>
                        <Text style={SERVICES_STYLES.detailLabel}>
                      Цена
                        </Text>
                        <Text style={SERVICES_STYLES.priceValue}>
                      {formatPrice(service.price)}
                        </Text>
                  </div>
                  <div>
                        <Text style={SERVICES_STYLES.detailLabel}>
                      Буфер до
                        </Text>
                        <Text style={SERVICES_STYLES.detailValue}>
                      {service.bufferBefore || 0} мин
                        </Text>
                  </div>
                  <div>
                        <Text style={SERVICES_STYLES.detailLabel}>
                      Буфер после
                        </Text>
                        <Text style={SERVICES_STYLES.detailValue}>
                      {service.bufferAfter || 0} мин
                        </Text>
                  </div>
                </div>
                  </Div>
                </Group>
              </VKCard>
          ))}
        </div>
        </Group>
      )}

      {/* Модальное окно создания услуги */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Добавить услугу"
        actions={
          <>
            <Button mode="secondary" onClick={closeCreateModal}>
              Отмена
            </Button>
            <Button 
              mode="primary" 
              onClick={handleCreateService}
              disabled={!formData.title || !formData.durationMinutes || !formData.price}
            >
              Создать услугу
            </Button>
          </>
        }
      >
        <FormItem top="Название услуги *">
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Например: Маникюр"
            required
          />
        </FormItem>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormItem top="Длительность (минуты) *">
            <Input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
              placeholder="60"
              required
            />
          </FormItem>

          <FormItem top="Цена (₽) *">
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              placeholder="2000"
              required
            />
          </FormItem>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormItem top="Буфер до (минуты)">
            <Input
              type="number"
              value={formData.bufferBefore}
              onChange={(e) => setFormData({ ...formData, bufferBefore: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </FormItem>

          <FormItem top="Буфер после (минуты)">
            <Input
              type="number"
              value={formData.bufferAfter}
              onChange={(e) => setFormData({ ...formData, bufferAfter: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </FormItem>
        </div>

        <FormItem top="Цвет">
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            style={{ 
              width: '100%', 
              height: '40px',
              border: '1px solid var(--vkui--color_border)',
              borderRadius: '8px',
            }}
          />
        </FormItem>
      </Modal>

      {/* Модальное окно редактирования услуги */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Редактировать услугу"
        actions={
          <>
            <Button mode="secondary" onClick={closeEditModal}>
              Отмена
            </Button>
            <Button 
              mode="primary" 
              onClick={handleUpdateService}
              disabled={!formData.title || !formData.durationMinutes || !formData.price}
            >
              Сохранить изменения
            </Button>
          </>
        }
      >
        <FormItem top="Название услуги *">
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Например: Маникюр"
            required
          />
        </FormItem>

        <div style={SERVICES_STYLES.formGrid}>
          <FormItem top="Длительность (минуты) *">
            <Input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
              placeholder="60"
              required
            />
          </FormItem>

          <FormItem top="Цена (₽) *">
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              placeholder="2000"
              required
            />
          </FormItem>
        </div>

        <div style={SERVICES_STYLES.formGrid}>
          <FormItem top="Буфер до (минуты)">
            <Input
              type="number"
              value={formData.bufferBefore}
              onChange={(e) => setFormData({ ...formData, bufferBefore: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </FormItem>

          <FormItem top="Буфер после (минуты)">
            <Input
              type="number"
              value={formData.bufferAfter}
              onChange={(e) => setFormData({ ...formData, bufferAfter: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </FormItem>
        </div>

        <FormItem top="Цвет">
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            style={SERVICES_STYLES.colorInput}
          />
        </FormItem>
      </Modal>
    </div>
  );
});
