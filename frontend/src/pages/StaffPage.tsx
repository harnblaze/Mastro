import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  Avatar,
  Badge,
  Group,
  Header
} from '@vkontakte/vkui';
import type { Staff, Service } from '../types';
import { apiService } from '../services/api';
import { Modal } from '../components/Modal';
import { LoadingScreen } from '../components/LoadingScreen';

// Стили
const STAFF_STYLES = {
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
  staffCard: {
    padding: '16px',
  } as const,
  staffHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  } as const,
  staffInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as const,
  staffActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  } as const,
  phoneText: {
    fontSize: '14px',
    color: 'var(--vkui--color_text_secondary)',
    marginBottom: '4px',
  } as const,
  servicesLabel: {
    fontSize: '14px',
    color: 'var(--vkui--color_text_secondary)',
    marginBottom: '8px',
  } as const,
  servicesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  } as const,
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  } as const,
  servicesButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  } as const,
} as const;

export const StaffPage: React.FC = memo(() => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Форма создания/редактирования сотрудника
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceIds: [] as string[],
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [staffData, servicesData] = await Promise.all([
        apiService.getStaff(businessId!),
        apiService.getServices(businessId!),
      ]);
      setStaff(staffData);
      setServices(servicesData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка загрузки данных'
        : 'Ошибка загрузки данных';
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

  const handleCreateStaff = useCallback(async () => {
    try {
      await apiService.createStaff(businessId!, formData);
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка создания сотрудника'
        : 'Ошибка создания сотрудника';
      setError(errorMessage);
    }
  }, [businessId, formData, loadData]);

  const handleUpdateStaff = useCallback(async () => {
    if (!selectedStaff) return;
    
    try {
      await apiService.updateStaff(businessId!, selectedStaff.id, formData);
      setShowEditModal(false);
      setSelectedStaff(null);
      resetForm();
      loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка обновления сотрудника'
        : 'Ошибка обновления сотрудника';
      setError(errorMessage);
    }
  }, [selectedStaff, businessId, formData, loadData]);

  const handleDeleteStaff = useCallback(async (staffId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) return;
    
    try {
      await apiService.deleteStaff(businessId!, staffId);
      loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка удаления сотрудника'
        : 'Ошибка удаления сотрудника';
      setError(errorMessage);
    }
  }, [businessId, loadData]);

  const handleEditStaff = useCallback((staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      phone: staffMember.phone || '',
      serviceIds: staffMember.serviceIds || [],
    });
    setShowEditModal(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      phone: '',
      serviceIds: [],
    });
  }, []);

  const handleServiceToggle = useCallback((serviceId: string) => {
    const newServiceIds = formData.serviceIds.includes(serviceId)
      ? formData.serviceIds.filter(id => id !== serviceId)
      : [...formData.serviceIds, serviceId];
    
    setFormData({ ...formData, serviceIds: newServiceIds });
  }, [formData]);

  const handleBack = useCallback(() => navigate(`/businesses/${businessId}`), [navigate, businessId]);
  const openCreateModal = useCallback(() => setShowCreateModal(true), []);
  const closeCreateModal = useCallback(() => setShowCreateModal(false), []);
  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedStaff(null);
  }, []);

  const filteredStaff = useMemo(() => 
    staff.filter(staffMember =>
      staffMember.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [staff, searchQuery]
  );

  const getStaffServices = useCallback((serviceIds: string[]) => {
    return services.filter(service => serviceIds.includes(service.id));
  }, [services]);


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
          <Title level="1">Управление сотрудниками</Title>
        </Header>
        <Div style={STAFF_STYLES.headerActions}>
          <div style={STAFF_STYLES.headerLeft}>
            <Button 
              size="s" 
              mode="tertiary"
              onClick={handleBack}
            >
              ← Назад
            </Button>
          </div>
          <Button size="m" mode="secondary" onClick={openCreateModal}>
            Добавить сотрудника
          </Button>
        </Div>
      </Group>

      {/* Поиск */}
      <Card style={{ marginBottom: '20px' }}>
        <Div>
          <FormItem top="Поиск сотрудников">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введите имя или должность..."
            />
          </FormItem>
        </Div>
      </Card>

      {/* Список сотрудников */}
      {filteredStaff.length === 0 ? (
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
            <Text weight="2" style={{ fontSize: '48px', marginBottom: '16px' }}>👥</Text>
            <Text weight="2" style={{ fontSize: '20px', marginBottom: '8px' }}>
              {searchQuery ? 'Сотрудники не найдены' : 'У вас пока нет сотрудников'}
            </Text>
            <Text style={{ marginBottom: '24px', color: 'var(--vkui--color_text_secondary)' }}>
              {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первого сотрудника для начала работы'}
            </Text>
            <Button mode="secondary" onClick={openCreateModal}>
              Добавить сотрудника
            </Button>
          </Div>
        </Group>
      ) : (
        <CardGrid size="l">
          {filteredStaff.map((staffMember) => (
            <Card key={staffMember.id} style={{ marginBottom: '16px' }}>
              <div style={STAFF_STYLES.staffCard}>
                <div style={STAFF_STYLES.staffHeader}>
                  <div style={STAFF_STYLES.staffInfo}>
                    <Avatar size={48}>
                      {staffMember.name.charAt(0)}
                    </Avatar>
                    <div>
                      <Text weight="2" style={{ fontSize: '18px' }}>{staffMember.name}</Text>
                    </div>
                  </div>
                  <div style={STAFF_STYLES.staffActions}>
                    <Button 
                      size="s" 
                      mode="tertiary"
                      onClick={() => handleEditStaff(staffMember)}
                    >
                      Изменить
                    </Button>
                    <Button 
                      size="s" 
                      mode="secondary"
                      onClick={() => handleDeleteStaff(staffMember.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>

                <Separator style={{ margin: '12px 0' }} />

                <div style={{ marginBottom: '12px' }}>
                  {staffMember.phone && (
                    <Text style={STAFF_STYLES.phoneText}>
                      📞 {staffMember.phone}
                    </Text>
                  )}
                </div>

                {staffMember.serviceIds && staffMember.serviceIds.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <Text style={STAFF_STYLES.servicesLabel}>
                      Услуги:
                    </Text>
                    <div style={STAFF_STYLES.servicesContainer}>
                      {getStaffServices(staffMember.serviceIds).map(service => (
                        <Badge key={service.id} mode="prominent">
                          {service.title}
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

      {/* Модальное окно создания сотрудника */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Добавить сотрудника"
        actions={
          <>
            <Button mode="secondary" onClick={closeCreateModal}>
              Отмена
            </Button>
            <Button 
              mode="primary" 
              onClick={handleCreateStaff}
              disabled={!formData.name}
            >
              Создать сотрудника
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormItem top="Имя *">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Имя сотрудника"
              required
            />
          </FormItem>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormItem top="Телефон">
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
            />
          </FormItem>
        </div>

        <FormItem top="Услуги">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {services.map(service => (
              <Button
                key={service.id}
                size="s"
                mode={formData.serviceIds.includes(service.id) ? 'primary' : 'secondary'}
                onClick={() => handleServiceToggle(service.id)}
              >
                {service.title}
              </Button>
            ))}
          </div>
        </FormItem>
      </Modal>

      {/* Модальное окно редактирования сотрудника */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Редактировать сотрудника"
        actions={
          <>
            <Button mode="secondary" onClick={closeEditModal}>
              Отмена
            </Button>
            <Button 
              mode="primary" 
              onClick={handleUpdateStaff}
              disabled={!formData.name}
            >
              Сохранить изменения
            </Button>
          </>
        }
      >
        <div style={STAFF_STYLES.formGrid}>
          <FormItem top="Имя *">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Имя сотрудника"
              required
            />
          </FormItem>
        </div>

        <div style={STAFF_STYLES.formGrid}>
          <FormItem top="Телефон">
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
            />
          </FormItem>
        </div>

        <FormItem top="Услуги">
          <div style={STAFF_STYLES.servicesButtons}>
            {services.map(service => (
              <Button
                key={service.id}
                size="s"
                mode={formData.serviceIds.includes(service.id) ? 'primary' : 'secondary'}
                onClick={() => handleServiceToggle(service.id)}
              >
                {service.title}
              </Button>
            ))}
          </div>
        </FormItem>
      </Modal>
    </div>
  );
});
