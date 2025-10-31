export declare class CreateNotificationTemplateDto {
    type: 'CONFIRM' | 'REMINDER' | 'CANCEL' | 'OTHER';
    channel: 'SMS' | 'EMAIL' | 'VK';
    subject?: string;
    message: string;
    isActive?: boolean;
}
export declare class UpdateNotificationTemplateDto {
    subject?: string;
    message?: string;
    isActive?: boolean;
}
