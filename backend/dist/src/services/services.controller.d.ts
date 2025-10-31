import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
export declare class ServicesController {
    private servicesService;
    constructor(servicesService: ServicesService);
    create(req: any, businessId: string, createServiceDto: CreateServiceDto): Promise<{
        id: string;
        businessId: string;
        title: string;
        durationMinutes: number;
        price: number;
        bufferBefore: number;
        bufferAfter: number;
        color: string | null;
    }>;
    findAll(req: any, businessId: string): Promise<{
        id: string;
        businessId: string;
        title: string;
        durationMinutes: number;
        price: number;
        bufferBefore: number;
        bufferAfter: number;
        color: string | null;
    }[]>;
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
    update(req: any, id: string, updateServiceDto: UpdateServiceDto): Promise<{
        id: string;
        businessId: string;
        title: string;
        durationMinutes: number;
        price: number;
        bufferBefore: number;
        bufferAfter: number;
        color: string | null;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        businessId: string;
        title: string;
        durationMinutes: number;
        price: number;
        bufferBefore: number;
        bufferAfter: number;
        color: string | null;
    }>;
}
