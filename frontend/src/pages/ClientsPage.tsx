import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Div,
    Title,
    Text,
    Button,
    Avatar,
    Separator,
    Card,
    CardGrid,
    IconButton,
    FormItem,
    Input,
    Group,
    Header
} from '@vkontakte/vkui';
import type { Client, Booking } from '../types';
import { apiService } from '../services/api';
import { Modal } from '../components/Modal';
import { LoadingScreen } from '../components/LoadingScreen';

// Стили
const CLIENTS_STYLES = {
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
    clientCard: {
        padding: '16px',
    } as const,
    clientHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
    } as const,
    clientInfo: {
        flex: 1,
    } as const,
    clientActions: {
        display: 'flex',
        gap: '8px',
    } as const,
    clientName: {
        color: 'var(--vkui--color_text_secondary)',
        fontSize: '14px',
    } as const,
    clientEmail: {
        color: 'var(--vkui--color_text_secondary)',
        fontSize: '14px',
    } as const,
    notesText: {
        fontSize: '14px',
        color: 'var(--vkui--color_text_secondary)',
    } as const,
    bookingsLabel: {
        fontSize: '14px',
        color: 'var(--vkui--color_text_secondary)',
        marginBottom: '8px',
    } as const,
    bookingItem: {
        marginBottom: '4px',
    } as const,
    bookingText: {
        fontSize: '12px',
        color: 'var(--vkui--color_text_secondary)',
    } as const,
    moreBookingsText: {
        fontSize: '12px',
        color: 'var(--vkui--color_text_secondary)',
    } as const,
} as const;

export const ClientsPage: React.FC = memo(() => {
    const { businessId } = useParams<{ businessId: string }>();
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Форма создания/редактирования клиента
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: '',
    });

    const loadClients = useCallback(async () => {
        try {
            setIsLoading(true);
            const clientsData = await apiService.getClients(businessId!);
            setClients(clientsData);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка загрузки клиентов'
                : 'Ошибка загрузки клиентов';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        if (businessId) {
            loadClients();
        }
    }, [businessId, loadClients]);

    const handleCreateClient = useCallback(async () => {
        try {
            await apiService.createClient(businessId!, formData);
            setShowCreateModal(false);
            resetForm();
            loadClients();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка создания клиента'
                : 'Ошибка создания клиента';
            setError(errorMessage);
        }
    }, [businessId, formData, loadClients]);

    const handleUpdateClient = useCallback(async () => {
        if (!selectedClient) return;

        try {
            await apiService.updateClient(selectedClient.id, formData);
            setShowEditModal(false);
            resetForm();
            setSelectedClient(null);
            loadClients();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка обновления клиента'
                : 'Ошибка обновления клиента';
            setError(errorMessage);
        }
    }, [selectedClient, formData, loadClients]);

    const handleDeleteClient = useCallback(async (clientId: string) => {
        try {
            await apiService.deleteClient(clientId);
            loadClients();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка удаления клиента'
                : 'Ошибка удаления клиента';
            setError(errorMessage);
        }
    }, [loadClients]);

    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            notes: '',
        });
    }, []);

    const openEditModal = useCallback((client: Client) => {
        setSelectedClient(client);
        setFormData({
            name: client.name,
            phone: client.phone,
            email: client.email || '',
            notes: client.notes || '',
        });
        setShowEditModal(true);
    }, []);

    const getInitials = useCallback((name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }, []);

    const formatPhone = useCallback((phone: string) => {
        // Простое форматирование телефона
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('7')) {
            return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
        }
        return phone;
    }, []);

    const handleBack = useCallback(() => navigate(`/businesses/${businessId}`), [navigate, businessId]);
    const openCreateModal = useCallback(() => setShowCreateModal(true), []);
    const closeCreateModal = useCallback(() => setShowCreateModal(false), []);
    const closeEditModal = useCallback(() => {
        setShowEditModal(false);
        setSelectedClient(null);
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
                        <Button size="m" mode="primary" onClick={loadClients}>
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
                    <Title level="1">Клиенты</Title>
                </Header>
                <Div style={CLIENTS_STYLES.headerActions}>
                    <div style={CLIENTS_STYLES.headerLeft}>
                        <Button
                            size="s"
                            mode="tertiary"
                            onClick={handleBack}
                        >
                            ← Назад
                        </Button>
                    </div>
                    <Button size="m" mode="secondary" onClick={openCreateModal}>
                        Добавить клиента
                    </Button>
                </Div>
            </Group>

            {clients.length === 0 ? (
                <Group>
                    <Div style={CLIENTS_STYLES.emptyState}>
                        <Text weight="2" style={{ fontSize: '48px', marginBottom: '16px' }}>👥</Text>
                        <Text weight="2" style={{ fontSize: '20px', marginBottom: '8px' }}>У вас пока нет клиентов</Text>
                        <Text style={{ marginBottom: '24px', color: 'var(--vkui--color_text_secondary)' }}>
                            Добавьте первого клиента для начала работы
                        </Text>
                        <Button mode="secondary" onClick={openCreateModal}>
                            Добавить клиента
                        </Button>
                    </Div>
                </Group>
            ) : (
                <CardGrid size="l">
                    {clients.map((client) => (
                        <Card key={client.id} style={{ marginBottom: '16px' }}>
                            <div style={CLIENTS_STYLES.clientCard}>
                                <div style={CLIENTS_STYLES.clientHeader}>
                                    <Avatar size={40} style={{ marginRight: '12px' }}>
                                        {getInitials(client.name)}
                                    </Avatar>
                                    <div style={CLIENTS_STYLES.clientInfo}>
                                        <Text weight="2">{client.name}</Text>
                                        <Text style={CLIENTS_STYLES.clientName}>
                                            {formatPhone(client.phone)}
                                        </Text>
                                        {client.email && (
                                            <Text style={CLIENTS_STYLES.clientEmail}>
                                                {client.email}
                                            </Text>
                                        )}
                                    </div>
                                    <div style={CLIENTS_STYLES.clientActions}>
                                        <IconButton
                                            onClick={() => openEditModal(client)}
                                            aria-label="Редактировать"
                                        >
                                            ✏️
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDeleteClient(client.id)}
                                            aria-label="Удалить"
                                        >
                                            🗑️
                                        </IconButton>
                                    </div>
                                </div>

                                {client.notes && (
                                    <>
                                        <Separator style={{ margin: '12px 0' }} />
                                        <Text style={CLIENTS_STYLES.notesText}>
                                            {client.notes}
                                        </Text>
                                    </>
                                )}

                                {client.bookings && client.bookings.length > 0 && (
                                    <>
                                        <Separator style={{ margin: '12px 0' }} />
                                        <Text style={CLIENTS_STYLES.bookingsLabel}>
                                            Последние записи:
                                        </Text>
                                        {client.bookings.slice(0, 3).map((booking: Booking) => (
                                            <div key={booking.id} style={CLIENTS_STYLES.bookingItem}>
                                                <Text style={CLIENTS_STYLES.bookingText}>
                                                    {new Date(booking.startTs).toLocaleDateString('ru-RU')} - {booking.service?.title}
                                                </Text>
                                            </div>
                                        ))}
                                        {client.bookings.length > 3 && (
                                            <Text style={CLIENTS_STYLES.moreBookingsText}>
                                                и еще {client.bookings.length - 3} записей...
                                            </Text>
                                        )}
                                    </>
                                )}
                            </div>
                        </Card>
                    ))}
                </CardGrid>
            )}

            {/* Модальное окно создания клиента */}
            <Modal
                isOpen={showCreateModal}
                onClose={closeCreateModal}
                title="Новый клиент"
                actions={
                    <>
                        <Button mode="secondary" onClick={closeCreateModal}>
                            Отмена
                        </Button>
                        <Button
                            mode="primary"
                            onClick={handleCreateClient}
                            disabled={!formData.name || !formData.phone}
                        >
                            Создать клиента
                        </Button>
                    </>
                }
            >
                <FormItem top="Имя *">
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Введите имя клиента"
                        required
                    />
                </FormItem>

                <FormItem top="Телефон *">
                    <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Введите номер телефона"
                        required
                    />
                </FormItem>

                <FormItem top="Email">
                    <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Введите email (необязательно)"
                    />
                </FormItem>

                <FormItem top="Заметки">
                    <Input
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Дополнительная информация о клиенте"
                    />
                </FormItem>
            </Modal>

            {/* Модальное окно редактирования клиента */}
            <Modal
                isOpen={showEditModal}
                onClose={closeEditModal}
                title="Редактировать клиента"
                actions={
                    <>
                        <Button mode="secondary" onClick={closeEditModal}>
                            Отмена
                        </Button>
                        <Button
                            mode="primary"
                            onClick={handleUpdateClient}
                            disabled={!formData.name || !formData.phone}
                        >
                            Сохранить изменения
                        </Button>
                    </>
                }
            >
                <FormItem top="Имя *">
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Введите имя клиента"
                        required
                    />
                </FormItem>

                <FormItem top="Телефон *">
                    <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Введите номер телефона"
                        required
                    />
                </FormItem>

                <FormItem top="Email">
                    <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Введите email (необязательно)"
                    />
                </FormItem>

                <FormItem top="Заметки">
                    <Input
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Дополнительная информация о клиенте"
                    />
                </FormItem>
            </Modal>
        </div>
    );
});
