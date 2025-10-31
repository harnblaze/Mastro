import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
export declare class ClientsController {
    private clientsService;
    constructor(clientsService: ClientsService);
    create(req: any, businessId: string, createClientDto: CreateClientDto): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        name: string;
        phone: string;
        businessId: string;
        notes: string | null;
    }>;
    findAll(req: any, businessId: string): Promise<({
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
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, updateClientDto: UpdateClientDto): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        name: string;
        phone: string;
        businessId: string;
        notes: string | null;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        name: string;
        phone: string;
        businessId: string;
        notes: string | null;
    }>;
}
