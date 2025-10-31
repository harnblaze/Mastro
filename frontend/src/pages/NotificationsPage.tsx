import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Div,
    Title,
    Text,
    Button,
    Alert,
    Separator,
    Card,
    CardGrid,
    Badge,
    FormItem,
    Input,
    Group,
    Header
} from '@vkontakte/vkui';
import type { Notification } from '../types';
import { apiService } from '../services/api';
import { LoadingScreen } from '../components/LoadingScreen';
import { Modal } from '../components/Modal';

// Стили
const NOTIFICATIONS_STYLES = {
    headerActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    } as const,
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    } as const,
    cardContent: {
        padding: '16px',
    } as const,
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
    } as const,
    cardDetails: {
        marginBottom: '12px',
    } as const,
    cardActions: {
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
    } as const,
    select: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    } as const,
    modalActions: {
        display: 'flex',
        gap: '12px',
        marginTop: '20px',
    } as const,
} as const;

export const NotificationsPage: React.FC = memo(() => {
    const { businessId } = useParams<{ businessId: string }>();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Форма создания уведомления
    const [formData, setFormData] = useState({
        bookingId: '',
        type: 'SMS' as 'SMS' | 'EMAIL' | 'VK',
        template: 'BOOKING_CREATED' as 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_REMINDER',
        customMessage: '',
    });

    const loadNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            const notificationsData = await apiService.getNotifications(businessId!);
            setNotifications(notificationsData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка загрузки уведомлений');
        } finally {
            setIsLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        if (businessId) {
            loadNotifications();
        }
    }, [businessId, loadNotifications]);

    const handleCreateNotification = useCallback(async () => {
        try {
            await apiService.createNotification(businessId!, formData);
            setShowCreateModal(false);
            resetForm();
            loadNotifications();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка создания уведомления');
        }
    }, [businessId, formData, loadNotifications]);

    const handleResendNotification = useCallback(async (notificationId: string) => {
        try {
            await apiService.resendNotification(notificationId);
            loadNotifications();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка повторной отправки');
        }
    }, [loadNotifications]);

    const resetForm = useCallback(() => {
        setFormData({
            bookingId: '',
            type: 'SMS',
            template: 'BOOKING_CREATED',
            customMessage: '',
        });
    }, []);

    const getStatusText = useCallback((status: string) => {
        switch (status) {
            case 'PENDING': return 'Ожидает';
            case 'SENT': return 'Отправлено';
            case 'FAILED': return 'Ошибка';
            default: return status;
        }
    }, []);

    const getTypeText = useCallback((type: string) => {
        switch (type) {
            case 'SMS': return '📱 SMS';
            case 'EMAIL': return '📧 Email';
            case 'VK': return '💬 VK';
            default: return type;
        }
    }, []);

    const getTemplateText = useCallback((template: string) => {
        switch (template) {
            case 'BOOKING_CREATED': return 'Создание записи';
            case 'BOOKING_CONFIRMED': return 'Подтверждение записи';
            case 'BOOKING_CANCELLED': return 'Отмена записи';
            case 'BOOKING_REMINDER': return 'Напоминание';
            default: return template;
        }
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <Alert
                onClose={() => setError('')}
                actions={[
                    {
                        title: 'Повторить',
                        mode: 'default',
                        action: loadNotifications,
                    },
                ]}
            >
                {error}
            </Alert>
        );
    }

    return (
        <div>
            <Group>
                <Header>
                    <Title level="1">Уведомления</Title>
                </Header>
                <Div style={NOTIFICATIONS_STYLES.headerActions}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Button
                            size="s"
                            mode="tertiary"
                            onClick={() => navigate(`/businesses/${businessId}`)}
                        >
                            ← Назад
                        </Button>
                    </div>
                    <Button size="m" onClick={() => setShowCreateModal(true)}>
                        Отправить уведомление
                    </Button>
                </Div>
            </Group>

            {notifications.length === 0 ? (
                <Alert
                    onClose={() => { }}
                    actions={[
                        {
                            title: 'Отправить уведомление',
                            mode: 'default',
                            action: () => setShowCreateModal(true),
                        },
                    ]}
                >
                    У вас пока нет уведомлений
                </Alert>
            ) : (
                <CardGrid size="l">
                    {notifications.map((notification) => (
                        <Card key={notification.id} style={{ marginBottom: '16px' }}>
                            <div style={NOTIFICATIONS_STYLES.cardContent}>
                                <div style={NOTIFICATIONS_STYLES.cardHeader}>
                                    <div>
                                        <Text weight="2">{getTypeText(notification.type)}</Text>
                                        <Text style={{ color: '#6D7885', fontSize: '14px' }}>
                                            {getTemplateText(notification.template)}
                                        </Text>
                                    </div>
                                    <Badge mode="prominent">
                                        {getStatusText(notification.status)}
                                    </Badge>
                                </div>

                                <Separator style={{ margin: '12px 0' }} />

                                <div style={NOTIFICATIONS_STYLES.cardDetails}>
                                    <Text style={{ fontSize: '14px', color: '#6D7885' }}>
                                        Клиент: {notification.client?.name || 'Не указан'}
                                    </Text>
                                    <Text style={{ fontSize: '14px', color: '#6D7885' }}>
                                        Запись: {notification.booking?.service?.title || 'Не указана'}
                                    </Text>
                                </div>

                                <div style={NOTIFICATIONS_STYLES.cardDetails}>
                                    <Text style={{ fontSize: '14px', color: '#6D7885' }}>
                                        Сообщение:
                                    </Text>
                                    <Text style={{ fontSize: '12px', color: '#6D7885', fontStyle: 'italic' }}>
                                        {notification.message}
                                    </Text>
                                </div>

                                <div style={NOTIFICATIONS_STYLES.cardDetails}>
                                    <Text style={{ fontSize: '14px', color: '#6D7885' }}>
                                        Создано: {new Date(notification.createdAt).toLocaleString('ru-RU')}
                                    </Text>
                                    {notification.sentAt && (
                                        <Text style={{ fontSize: '14px', color: '#6D7885' }}>
                                            Отправлено: {new Date(notification.sentAt).toLocaleString('ru-RU')}
                                        </Text>
                                    )}
                                </div>

                                <div style={NOTIFICATIONS_STYLES.cardActions}>
                                    {notification.status === 'FAILED' && (
                                        <Button
                                            size="s"
                                            mode="primary"
                                            onClick={() => handleResendNotification(notification.id)}
                                        >
                                            Повторить отправку
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </CardGrid>
            )}

            {/* Модальное окно создания уведомления */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Отправить уведомление"
                actions={
                    <>
                        <Button mode="secondary" onClick={() => setShowCreateModal(false)}>
                            Отмена
                        </Button>
                        <Button
                            mode="primary"
                            onClick={handleCreateNotification}
                            disabled={!formData.bookingId}
                        >
                            Отправить уведомление
                        </Button>
                    </>
                }
            >

                            <FormItem top="ID записи *">
                                <Input
                                    value={formData.bookingId}
                                    onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                                    placeholder="Введите ID записи"
                                    required
                                />
                            </FormItem>

                <FormItem top="Тип уведомления">
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        style={NOTIFICATIONS_STYLES.select}
                    >
                                    <option value="SMS">📱 SMS</option>
                                    <option value="EMAIL">📧 Email</option>
                                    <option value="VK">💬 VK</option>
                                </select>
                            </FormItem>

                <FormItem top="Шаблон">
                    <select
                        value={formData.template}
                        onChange={(e) => setFormData({ ...formData, template: e.target.value as any })}
                        style={NOTIFICATIONS_STYLES.select}
                    >
                                    <option value="BOOKING_CREATED">Создание записи</option>
                                    <option value="BOOKING_CONFIRMED">Подтверждение записи</option>
                                    <option value="BOOKING_CANCELLED">Отмена записи</option>
                                    <option value="BOOKING_REMINDER">Напоминание</option>
                                </select>
                            </FormItem>

                            <FormItem top="Кастомное сообщение (необязательно)">
                                <Input
                                    value={formData.customMessage}
                                    onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                                    placeholder="Введите кастомное сообщение"
                                />
                            </FormItem>

            </Modal>
        </div>
    );
});
