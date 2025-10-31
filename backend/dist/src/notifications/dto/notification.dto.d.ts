export declare class CreateNotificationDto {
    bookingId: string;
    type: 'SMS' | 'EMAIL' | 'VK';
    template: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_REMINDER';
    customMessage?: string;
}
export declare class NotificationQueryDto {
    bookingId?: string;
    type?: 'SMS' | 'EMAIL' | 'VK';
    status?: 'PENDING' | 'SENT' | 'FAILED';
}
