import { PrismaService } from '../prisma/prisma.service';
export interface NotificationTemplate {
    id: string;
    businessId: string;
    type: 'CONFIRM' | 'REMINDER' | 'CANCEL' | 'OTHER';
    channel: 'SMS' | 'EMAIL' | 'VK';
    subject?: string;
    message: string;
    variables: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CreateNotificationTemplateDto {
    type: 'CONFIRM' | 'REMINDER' | 'CANCEL' | 'OTHER';
    channel: 'SMS' | 'EMAIL' | 'VK';
    subject?: string;
    message: string;
    isActive?: boolean;
}
export interface UpdateNotificationTemplateDto {
    subject?: string;
    message?: string;
    isActive?: boolean;
}
export declare class NotificationTemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
    getTemplates(businessId: string, userId: string): Promise<NotificationTemplate[]>;
    getTemplate(templateId: string, userId: string): Promise<NotificationTemplate>;
    createTemplate(businessId: string, userId: string, data: CreateNotificationTemplateDto): Promise<NotificationTemplate>;
    updateTemplate(templateId: string, userId: string, data: UpdateNotificationTemplateDto): Promise<NotificationTemplate>;
    deleteTemplate(templateId: string, userId: string): Promise<void>;
    getAvailableVariables(): Promise<{
        [key: string]: string;
    }>;
    processTemplate(templateId: string, variables: {
        [key: string]: string;
    }): Promise<{
        subject?: string;
        message: string;
    }>;
    private extractVariables;
}
