import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/business.dto';
export declare class BusinessService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createBusinessDto: CreateBusinessDto): Promise<{
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
    }>;
    findOne(id: string, userId: string): Promise<{
        owner: {
            id: string;
            vkId: string | null;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            passwordHash: string | null;
            createdAt: Date;
        };
        staff: {
            id: string;
            createdAt: Date;
            name: string;
            phone: string | null;
            businessId: string;
            userId: string | null;
        }[];
        services: {
            id: string;
            businessId: string;
            title: string;
            durationMinutes: number;
            price: number;
            bufferBefore: number;
            bufferAfter: number;
            color: string | null;
        }[];
    } & {
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
    }>;
    update(id: string, userId: string, updateBusinessDto: UpdateBusinessDto): Promise<{
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
    }>;
    findAllByOwner(userId: string): Promise<({
        staff: {
            id: string;
            createdAt: Date;
            name: string;
            phone: string | null;
            businessId: string;
            userId: string | null;
        }[];
        services: {
            id: string;
            businessId: string;
            title: string;
            durationMinutes: number;
            price: number;
            bufferBefore: number;
            bufferAfter: number;
            color: string | null;
        }[];
        _count: {
            clients: number;
            bookings: number;
        };
    } & {
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
    })[]>;
    private getDefaultWorkingHours;
}
