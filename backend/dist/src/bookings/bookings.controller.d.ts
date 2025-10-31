import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto } from './dto/booking.dto';
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    create(req: any, businessId: string, createBookingDto: CreateBookingDto): Promise<{
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
    }>;
    findAll(req: any, businessId: string, query: BookingQueryDto): Promise<({
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
    })[]>;
    getAvailableSlots(req: any, businessId: string, serviceId: string, staffId: string, date: string): Promise<string[]>;
    findOne(req: any, id: string): Promise<{
        staff: {
            id: string;
            createdAt: Date;
            name: string;
            phone: string | null;
            businessId: string;
            userId: string | null;
        };
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
    }>;
    update(req: any, id: string, updateBookingDto: UpdateBookingDto): Promise<{
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
    }>;
    remove(req: any, id: string): Promise<{
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
    }>;
}
