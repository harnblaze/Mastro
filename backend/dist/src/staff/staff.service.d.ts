import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
export declare class StaffService {
    private prisma;
    constructor(prisma: PrismaService);
    create(businessId: string, userId: string, createStaffDto: CreateStaffDto): Promise<{
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
        staffServices: ({
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
            staffId: string;
            serviceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        phone: string | null;
        businessId: string;
        userId: string | null;
    }>;
    findAll(businessId: string, userId: string): Promise<({
        staffServices: ({
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
            staffId: string;
            serviceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        phone: string | null;
        businessId: string;
        userId: string | null;
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
        staffServices: ({
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
            staffId: string;
            serviceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        phone: string | null;
        businessId: string;
        userId: string | null;
    }>;
    update(id: string, userId: string, updateStaffDto: UpdateStaffDto): Promise<{
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
        staffServices: ({
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
            staffId: string;
            serviceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        phone: string | null;
        businessId: string;
        userId: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        phone: string | null;
        businessId: string;
        userId: string | null;
    }>;
    private checkBusinessAccess;
}
