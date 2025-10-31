import { PrismaService } from '../prisma/prisma.service';
export interface AvailabilitySlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    reason?: string;
}
export interface DayAvailability {
    date: string;
    slots: AvailabilitySlot[];
    isWorkingDay: boolean;
    workingHours?: {
        start: string;
        end: string;
    };
}
export declare class AvailabilityService {
    private prisma;
    constructor(prisma: PrismaService);
    getBusinessAvailability(businessId: string, userId: string, date: string, serviceId?: string, staffId?: string): Promise<DayAvailability>;
    createAvailabilityException(businessId: string, userId: string, data: {
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
    getAvailabilityExceptions(businessId: string, userId: string, from?: string, to?: string): Promise<{
        id: string;
        businessId: string;
        type: import(".prisma/client").$Enums.AvailabilityExceptionType;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        reason: string | null;
    }[]>;
    deleteAvailabilityException(exceptionId: string, userId: string): Promise<{
        id: string;
        businessId: string;
        type: import(".prisma/client").$Enums.AvailabilityExceptionType;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        reason: string | null;
    }>;
    private getDayOfWeek;
    private generateTimeSlots;
    private minutesToTimeString;
}
