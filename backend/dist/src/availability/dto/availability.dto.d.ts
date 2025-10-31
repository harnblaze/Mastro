export declare class CreateAvailabilityExceptionDto {
    date: string;
    startTime?: string;
    endTime?: string;
    type: 'CLOSED' | 'OPEN_CUSTOM';
    reason?: string;
}
export declare class AvailabilityQueryDto {
    date: string;
    serviceId?: string;
    staffId?: string;
}
