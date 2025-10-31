import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(businessId: string, userId: string, createServiceDto: CreateServiceDto): Promise<{
        id: string;
        businessId: string;
        title: string;
        durationMinutes: number;
        price: number;
        bufferBefore: number;
        bufferAfter: number;
        color: string | null;
    }>;
    findAll(businessId: string, userId: string): Promise<{
        id: string;
        businessId: string;
        title: string;
        durationMinutes: number;
        price: number;
        bufferBefore: number;
        bufferAfter: number;
        color: string | null;
    }[]>;
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
    } & {
        id: string;
        businessId: string;
        title: string;
        durationMinutes: number;
        price: number;
        bufferBefore: number;
        bufferAfter: number;
        color: string | null;
    }>;
    update(id: string, userId: string, updateServiceDto: UpdateServiceDto): Promise<{
        id: string;
        businessId: string;
        title: string;
        durationMinutes: number;
        price: number;
        bufferBefore: number;
        bufferAfter: number;
        color: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        businessId: string;
        title: string;
        durationMinutes: number;
        price: number;
        bufferBefore: number;
        bufferAfter: number;
        color: string | null;
    }>;
    private checkBusinessAccess;
}
