export declare class CreateBookingDto {
    serviceId: string;
    staffId: string;
    startTs: string;
    clientId?: string;
    client?: {
        name: string;
        phone: string;
        email?: string;
    };
}
export declare class UpdateBookingDto {
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
}
export declare class BookingQueryDto {
    from?: string;
    to?: string;
    staffId?: string;
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
}
