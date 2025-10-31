import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Div,
    Title,
    Text,
    Button,
    Alert,
    Card,
    Avatar,
    Badge,
} from '@vkontakte/vkui';
import { Icon24CalendarOutline, Icon24PhoneOutline, Icon24LocationOutline } from '@vkontakte/icons';
import type { Business, Service, Staff } from '../types';
import { apiService } from '../services/api';
import { LoadingScreen } from '../components/LoadingScreen';

// Стили
const BUSINESS_CARD_STYLES = {
  headerWrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' } as const,
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } as const,
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '12px' } as const,
  cardPad: { padding: '20px' } as const,
  salonHeader: { display: 'flex', alignItems: 'center', marginBottom: '16px' } as const,
  avatarLg: { marginRight: '16px' } as const,
  contactRow: { display: 'flex', flexDirection: 'column', gap: '8px' } as const,
  servicesCol: { display: 'flex', flexDirection: 'column', gap: '12px' } as const,
  serviceItem: {
    padding: '16px', border: '1px solid var(--vkui--color_border)', borderRadius: '12px',
    backgroundColor: 'var(--vkui--color_background_secondary)'
  } as const,
  serviceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' } as const,
  staffCol: { display: 'flex', flexDirection: 'column', gap: '12px' } as const,
  staffItem: {
    display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid var(--vkui--color_border)',
    borderRadius: '8px', backgroundColor: 'var(--vkui--color_background_secondary)'
  } as const,
} as const;

export const BusinessCardPage: React.FC = memo(() => {
    const { businessId } = useParams<{ businessId: string }>();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<Business | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadBusinessData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [businessData, servicesData, staffData] = await Promise.all([
                apiService.getBusiness(businessId!),
                apiService.getServices(businessId!),
                apiService.getStaff(businessId!),
            ]);

            setBusiness(businessData);
            setServices(servicesData);
            setStaff(staffData);
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
            loadBusinessData();
        }
    }, [businessId, loadBusinessData]);

    const handleBookService = useCallback((serviceId: string) => {
        navigate(`/business/${businessId}/book/${serviceId}`);
    }, [navigate, businessId]);

    const formatPrice = useCallback((price: number) => `${price.toLocaleString('ru-RU')} ₽`, []);

    const formatDuration = useCallback((minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
        }
        return `${mins}м`;
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <Div>
                <Alert
                    onClose={() => setError('')}
                    actions={[
                        {
                            title: 'Попробовать снова',
                            mode: 'default',
                            action: loadBusinessData,
                        },
                    ]}
                >
                    {error}
                </Alert>
            </Div>
        );
    }

    if (!business) {
        return (
            <Div>
                <Alert onClose={() => { }}>
                    Салон не найден
                </Alert>
            </Div>
        );
    }

    const pageStyles = {
        minHeight: '100vh',
        padding: 0,
    } as const;

    return (
        <div style={pageStyles}>
            {/* Заголовок */}
            <div style={BUSINESS_CARD_STYLES.headerWrap}>
                <Title level="1">Карточка бизнеса</Title>
            </div>
            <div style={BUSINESS_CARD_STYLES.topBar}>
                <div style={BUSINESS_CARD_STYLES.topBarLeft}>
                    <Button
                        size="s"
                        mode="tertiary"
                        onClick={() => navigate('/businesses')}
                    >
                        ← Назад
                    </Button>
                </div>
            </div>

            {/* Заголовок салона */}
            <Card style={{ marginBottom: '16px' }}>
                <div style={BUSINESS_CARD_STYLES.cardPad}>
                    <div style={BUSINESS_CARD_STYLES.salonHeader}>
                        <Avatar
                            size={80}
                            src={business.photo || undefined}
                            style={BUSINESS_CARD_STYLES.avatarLg}
                        />
                        <div style={{ flex: 1 }}>
                            <Title level="1" style={{ marginBottom: '8px' }}>
                                {business.name}
                            </Title>
                            {business.description && (
                                <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                                    {business.description}
                                </Text>
                            )}
                        </div>
                    </div>

                    {/* Контактная информация */}
                    <div style={BUSINESS_CARD_STYLES.contactRow}>
                        {business.address && (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Icon24LocationOutline style={{ marginRight: '8px', color: 'var(--vkui--color_text_secondary)' }} />
                                <Text>{business.address}</Text>
                            </div>
                        )}
                        {business.phone && (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Icon24PhoneOutline style={{ marginRight: '8px', color: 'var(--vkui--color_text_secondary)' }} />
                                <Text>{business.phone}</Text>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Услуги */}
            <Card style={{ marginBottom: '16px' }}>
                <div style={BUSINESS_CARD_STYLES.cardPad}>
                    <Title level="2" style={{ marginBottom: '16px' }}>
                        Услуги
                    </Title>

                    {services.length === 0 ? (
                        <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                            Услуги пока не добавлены
                        </Text>
                    ) : (
                        <div style={BUSINESS_CARD_STYLES.servicesCol}>
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    style={BUSINESS_CARD_STYLES.serviceItem}
                                >
                                    <div style={BUSINESS_CARD_STYLES.serviceHeader}>
                                        <div style={{ flex: 1 }}>
                                            <Text weight="2" style={{ marginBottom: '4px' }}>
                                                {service.title}
                                            </Text>
                                            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                                                <Badge>
                                                    {formatDuration(service.durationMinutes)}
                                                </Badge>
                                                <Badge mode="prominent">
                                                    {formatPrice(service.price)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button
                                            size="m"
                                            mode="secondary"
                                            before={<Icon24CalendarOutline style={{ marginRight: '4px' }} />}
                                            onClick={() => handleBookService(service.id)}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            Записаться
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Персонал */}
            {staff.length > 0 && (
                <Card>
                    <div style={BUSINESS_CARD_STYLES.cardPad}>
                        <Title level="2" style={{ marginBottom: '16px' }}>
                            Мастера
                        </Title>

                        <div style={BUSINESS_CARD_STYLES.staffCol}>
                            {staff.map((member) => (
                                <div
                                    key={member.id}
                                    style={BUSINESS_CARD_STYLES.staffItem}
                                >
                                    <Avatar
                                        size={48}
                                        style={{ marginRight: '12px' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <Text weight="2">{member.name}</Text>
                                        {member.phone && (
                                            <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: '14px' }}>
                                                {member.phone}
                                            </Text>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
});