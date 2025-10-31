import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    create(req: any, businessId: string, createNotificationDto: CreateNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        businessId: string;
        clientId: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        bookingId: string;
        template: import(".prisma/client").$Enums.NotificationTemplateType;
        scheduledFor: Date;
        sentAt: Date | null;
    }>;
    findAll(req: any, businessId: string, query: NotificationQueryDto): Promise<({
        client: {
            id: string;
            email: string | null;
            createdAt: Date;
            name: string;
            phone: string;
            businessId: string;
            notes: string | null;
        };
        booking: {
            staff: {
                id: string;
                createdAt: Date;
                name: string;
                phone: string | null;
                businessId: string;
                userId: string | null;
            };
            service: {
                id: string;
                businessId: string;
                title: string;
                durationMinutes: number;
                price: number;
                bufferBefore: number;
                bufferAfter: number;
                color: string | null;
            };
            client: {
                id: string;
                email: string | null;
                createdAt: Date;
                name: string;
                phone: string;
                businessId: string;
                notes: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            businessId: string;
            staffId: string;
            serviceId: string;
            clientId: string | null;
            startTs: Date;
            endTs: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            source: import(".prisma/client").$Enums.BookingSource;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        businessId: string;
        clientId: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        bookingId: string;
        template: import(".prisma/client").$Enums.NotificationTemplateType;
        scheduledFor: Date;
        sentAt: Date | null;
    })[]>;
    findOne(req: any, id: string): Promise<{
        business: {
            id: string;
            email: string | null;
            createdAt: Date;
            name: string;
            ownerId: string;
            address: string | null;
            timezone: string;
            phone: string | null;
            website: string | null;
            description: string | null;
            workingHours: import("@prisma/client/runtime/library").JsonValue;
        };
        client: {
            id: string;
            email: string | null;
            createdAt: Date;
            name: string;
            phone: string;
            businessId: string;
            notes: string | null;
        };
        booking: {
            staff: {
                id: string;
                createdAt: Date;
                name: string;
                phone: string | null;
                businessId: string;
                userId: string | null;
            };
            service: {
                id: string;
                businessId: string;
                title: string;
                durationMinutes: number;
                price: number;
                bufferBefore: number;
                bufferAfter: number;
                color: string | null;
            };
            client: {
                id: string;
                email: string | null;
                createdAt: Date;
                name: string;
                phone: string;
                businessId: string;
                notes: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            businessId: string;
            staffId: string;
            serviceId: string;
            clientId: string | null;
            startTs: Date;
            endTs: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            source: import(".prisma/client").$Enums.BookingSource;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        businessId: string;
        clientId: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        bookingId: string;
        template: import(".prisma/client").$Enums.NotificationTemplateType;
        scheduledFor: Date;
        sentAt: Date | null;
    }>;
    resend(req: any, id: string): Promise<{
        message: string;
    }>;
}
