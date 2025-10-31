import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Div, Title, Text, Button, Separator, Card, CardGrid, Badge, FormItem, Input, Group, Header } from '@vkontakte/vkui';
import type { Booking, Service, Staff, Client } from '../types';
import { apiService } from '../services/api';
import { Modal } from '../components/Modal';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorScreen } from '../components/ErrorScreen';
// Стили
const BOOKINGS_STYLES = {
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
        color: 'var(--vkui--color_text_primary)'
    },
} as const;

// Стили вынесены в styles/bookings.ts

export const BookingsPage: React.FC = memo(() => {
    const { businessId } = useParams<{ businessId: string }>();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Форма создания записи
    const [formData, setFormData] = useState({
        serviceId: '',
        staffId: '',
        startTs: '',
        clientId: '',
        client: {
            name: '',
            phone: '',
            email: '',
        },
    });

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [bookingsData, servicesData, staffData, clientsData] = await Promise.all([
                apiService.getBookings(businessId!),
                apiService.getServices(businessId!),
                apiService.getStaff(businessId!),
                apiService.getClients(businessId!),
            ]);

            setBookings(bookingsData);
            setServices(servicesData);
            setStaff(staffData);
            setClients(clientsData);
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

    const handleCreateBooking = async () => {
        try {
            const bookingData = {
                serviceId: formData.serviceId,
                staffId: formData.staffId,
                startTs: formData.startTs,
                ...(formData.clientId ? { clientId: formData.clientId } : { client: formData.client }),
            };

            await apiService.createBooking(businessId!, bookingData);
            setShowCreateModal(false);
            resetForm();
            loadData();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка создания записи'
                : 'Ошибка создания записи';
            setError(errorMessage);
        }
    };

    const handleUpdateBooking = async (bookingId: string, status: string) => {
        try {
            await apiService.updateBooking(businessId!, bookingId, { status });
            loadData();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка обновления записи'
                : 'Ошибка обновления записи';
            setError(errorMessage);
        }
    };

    const handleDeleteBooking = async (bookingId: string) => {
        try {
            await apiService.deleteBooking(businessId!, bookingId);
            loadData();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка удаления записи'
                : 'Ошибка удаления записи';
            setError(errorMessage);
        }
    };

    const resetForm = () => {
        setFormData({
            serviceId: '',
            staffId: '',
            startTs: '',
            clientId: '',
            client: {
                name: '',
                phone: '',
                email: '',
            },
        });
    };

    // Перевод статусов теперь внутри BookingCard

    const handleBack = useCallback(() => navigate(`/businesses/${businessId}`), [navigate, businessId]);
    const openCreateModal = useCallback(() => setShowCreateModal(true), []);
    const closeCreateModal = useCallback(() => setShowCreateModal(false), []);

    const sortedBookings = useMemo(() =>
        [...bookings].sort((a, b) => new Date(b.startTs).getTime() - new Date(a.startTs).getTime())
    , [bookings]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return <ErrorScreen message={error} onRetry={loadData} />;
    }

    return (
        <div>
            {/* Заголовок */}
            <Group>
                <Header>
                    <Title level="1">Записи клиентов</Title>
                </Header>
                <Div style={BOOKINGS_STYLES.headerActions}>
                    <div style={BOOKINGS_STYLES.headerLeft}>
                        <Button
                            size="s"
                            mode="tertiary"
                            onClick={handleBack}
                        >
                            ← Назад
                        </Button>
                    </div>
                    <Button size="m" mode="secondary" onClick={openCreateModal}>
                        Новая запись
                    </Button>
                </Div>
            </Group>

            {bookings.length === 0 ? (
                <Group>
                    <Div style={BOOKINGS_STYLES.emptyState}>
                        <Text weight="2" style={{ fontSize: '48px', marginBottom: '16px' }}>📅</Text>
                        <Text weight="2" style={{ fontSize: '20px', marginBottom: '8px' }}>У вас пока нет записей клиентов</Text>
                        <Text style={{ marginBottom: '24px', color: 'var(--vkui--color_text_secondary)' }}>
                            Создайте первую запись для начала работы
                        </Text>
                        <Button mode="secondary" onClick={openCreateModal}>
                            Создать запись
                        </Button>
                    </Div>
                </Group>
            ) : (
                <CardGrid size="l">
                    {sortedBookings.map((booking) => (
                        <Card key={booking.id} style={{ marginBottom: '16px' }}>
                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <Text weight="2">{booking.service?.title}</Text>
                                        <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                                            {booking.staff?.name}
                                        </Text>
                                    </div>
                                    <Badge mode="prominent">
                                        {(() => {
                                            switch (booking.status) {
                                                case 'PENDING': return 'Ожидает';
                                                case 'CONFIRMED': return 'Подтверждена';
                                                case 'CANCELLED': return 'Отменена';
                                                case 'COMPLETED': return 'Завершена';
                                                case 'NO_SHOW': return 'Не пришел';
                                                default: return booking.status;
                                            }
                                        })()}
                                    </Badge>
                                </div>

                                <Separator style={{ margin: '12px 0' }} />

                                <div style={{ marginBottom: '12px' }}>
                                    <Text style={{ fontSize: '14px', color: 'var(--vkui--color_text_secondary)' }}>
                                        Клиент: {booking.client?.name || 'Не указан'}
                                    </Text>
                                    <Text style={{ fontSize: '14px', color: 'var(--vkui--color_text_secondary)' }}>
                                        Телефон: {booking.client?.phone || 'Не указан'}
                                    </Text>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <Text style={{ fontSize: '14px', color: 'var(--vkui--color_text_secondary)' }}>
                                        Дата: {new Date(booking.startTs).toLocaleDateString('ru-RU')}
                                    </Text>
                                    <Text style={{ fontSize: '14px', color: 'var(--vkui--color_text_secondary)' }}>
                                        Время: {new Date(booking.startTs).toLocaleTimeString('ru-RU', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    {booking.status === 'PENDING' && (
                                        <>
                                            <Button
                                                size="s"
                                                mode="primary"
                                                onClick={() => handleUpdateBooking(booking.id, 'CONFIRMED')}
                                            >
                                                Подтвердить
                                            </Button>
                                            <Button
                                                size="s"
                                                mode="secondary"
                                                onClick={() => handleUpdateBooking(booking.id, 'CANCELLED')}
                                            >
                                                Отменить
                                            </Button>
                                        </>
                                    )}
                                    {booking.status === 'CONFIRMED' && (
                                        <Button
                                            size="s"
                                            mode="primary"
                                            onClick={() => handleUpdateBooking(booking.id, 'COMPLETED')}
                                        >
                                            Завершить
                                        </Button>
                                    )}
                                    <Button
                                        size="s"
                                        mode="secondary"
                                        onClick={() => handleDeleteBooking(booking.id)}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </CardGrid>
            )}

            {/* Модальное окно создания записи */}
            <Modal
                isOpen={showCreateModal}
                onClose={closeCreateModal}
                title="Новая запись"
                actions={
                    <>
                        <Button mode="secondary" onClick={closeCreateModal}>
                            Отмена
                        </Button>
                        <Button mode="primary" onClick={handleCreateBooking}>
                            Создать запись
                        </Button>
                    </>
                }
            >
                <FormItem top="Услуга">
                    <select
                        value={formData.serviceId}
                        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            border: '1px solid var(--vkui--color_border)', 
                            borderRadius: '8px',
                            backgroundColor: 'var(--vkui--color_background)',
                            color: 'var(--vkui--color_text_primary)',
                            fontSize: '16px'
                        }}
                    >
                        <option value="">Выберите услугу</option>
                        {services.map((service) => (
                            <option key={service.id} value={service.id}>
                                {service.title} ({service.durationMinutes} мин)
                            </option>
                        ))}
                    </select>
                </FormItem>

                <FormItem top="Сотрудник">
                    <select
                        value={formData.staffId}
                        onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            border: '1px solid var(--vkui--color_border)', 
                            borderRadius: '8px',
                            backgroundColor: 'var(--vkui--color_background)',
                            color: 'var(--vkui--color_text_primary)',
                            fontSize: '16px'
                        }}
                    >
                        <option value="">Выберите сотрудника</option>
                        {staff.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                </FormItem>

                <FormItem top="Дата и время">
                    <Input
                        type="datetime-local"
                        value={formData.startTs}
                        onChange={(e) => setFormData({ ...formData, startTs: e.target.value })}
                        placeholder="Выберите дату и время"
                    />
                </FormItem>

                <FormItem top="Клиент">
                    <select
                        value={formData.clientId}
                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            border: '1px solid var(--vkui--color_border)', 
                            borderRadius: '8px',
                            backgroundColor: 'var(--vkui--color_background)',
                            color: 'var(--vkui--color_text_primary)',
                            fontSize: '16px'
                        }}
                    >
                        <option value="">Создать нового клиента</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name} ({client.phone})
                            </option>
                        ))}
                    </select>
                </FormItem>

                {!formData.clientId && (
                    <>
                        <FormItem top="Имя клиента">
                            <Input
                                value={formData.client.name}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    client: { ...formData.client, name: e.target.value }
                                })}
                                placeholder="Введите имя"
                            />
                        </FormItem>

                        <FormItem top="Телефон">
                            <Input
                                value={formData.client.phone}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    client: { ...formData.client, phone: e.target.value }
                                })}
                                placeholder="Введите телефон"
                            />
                        </FormItem>

                        <FormItem top="Email (необязательно)">
                            <Input
                                type="email"
                                value={formData.client.email}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    client: { ...formData.client, email: e.target.value }
                                })}
                                placeholder="Введите email"
                            />
                        </FormItem>
                    </>
                )}
            </Modal>
        </div>
    );
});
