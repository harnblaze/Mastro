import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(businessId: string, userId: string, createClientDto: CreateClientDto): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        name: string;
        phone: string;
        businessId: string;
        notes: string | null;
    }>;
    findAll(businessId: string, userId: string): Promise<({
        bookings: ({
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
        })[];
    } & {
        id: string;
        email: string | null;
        createdAt: Date;
        name: string;
        phone: string;
        businessId: string;
        notes: string | null;
    })[]>;
    findOne(id: string, userId: string): Promise<{
        bookings: ({
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
        })[];
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
    } & {
        id: string;
        email: string | null;
        createdAt: Date;
        name: string;
        phone: string;
        businessId: string;
        notes: string | null;
    }>;
    update(id: string, userId: string, updateClientDto: UpdateClientDto): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        name: string;
        phone: string;
        businessId: string;
        notes: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        name: string;
        phone: string;
        businessId: string;
        notes: string | null;
    }>;
    private checkBusinessAccess;
}
