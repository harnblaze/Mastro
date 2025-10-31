import { PrismaService } from '../prisma/prisma.service';
import { VkService } from '../auth/vk.service';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
export declare class NotificationsService {
    private prisma;
    private vkService;
    constructor(prisma: PrismaService, vkService: VkService);
    create(businessId: string, userId: string, createNotificationDto: CreateNotificationDto): Promise<{
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
    findAll(businessId: string, userId: string, query: NotificationQueryDto): Promise<({
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
    findOne(id: string, userId: string): Promise<{
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
    resend(id: string, userId: string): Promise<{
        message: string;
    }>;
    private generateMessage;
    private calculateScheduledTime;
    private sendNotificationAsync;
    private sendSMS;
    private sendEmail;
    private sendVK;
    private checkBusinessAccess;
}
