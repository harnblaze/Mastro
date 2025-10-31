import { AvailabilityService } from './availability.service';
export declare class AvailabilityController {
    private availabilityService;
    constructor(availabilityService: AvailabilityService);
    getAvailability(req: any, businessId: string, date: string, serviceId?: string, staffId?: string): Promise<import("./availability.service").DayAvailability>;
    getExceptions(req: any, businessId: string, from?: string, to?: string): Promise<{
        id: string;
        businessId: string;
        type: import(".prisma/client").$Enums.AvailabilityExceptionType;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        reason: string | null;
    }[]>;
    createException(req: any, businessId: string, data: {
        date: string;
        startTime?: string;
        endTime?: string;
        type: 'CLOSED' | 'OPEN_CUSTOM';
        reason?: string;
    }): Promise<{
        id: string;
        businessId: string;
        type: import(".prisma/client").$Enums.AvailabilityExceptionType;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        reason: string | null;
    }>;
    deleteException(req: any, exceptionId: string): Promise<{
        id: string;
        businessId: string;
        type: import(".prisma/client").$Enums.AvailabilityExceptionType;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        reason: string | null;
    }>;
}
