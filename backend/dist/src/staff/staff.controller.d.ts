import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
export declare class StaffController {
    private staffService;
    constructor(staffService: StaffService);
    create(req: any, businessId: string, createStaffDto: CreateStaffDto): Promise<{
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
    findAll(req: any, businessId: string): Promise<({
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
    update(req: any, id: string, updateStaffDto: UpdateStaffDto): Promise<{
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
    remove(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        phone: string | null;
        businessId: string;
        userId: string | null;
    }>;
}
