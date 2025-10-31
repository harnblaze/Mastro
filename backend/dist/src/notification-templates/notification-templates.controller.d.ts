import { NotificationTemplatesService } from './notification-templates.service';
import { CreateNotificationTemplateDto, UpdateNotificationTemplateDto } from './dto/notification-template.dto';
export declare class NotificationTemplatesController {
    private notificationTemplatesService;
    constructor(notificationTemplatesService: NotificationTemplatesService);
    getTemplates(req: any, businessId: string): Promise<import("./notification-templates.service").NotificationTemplate[]>;
    getAvailableVariables(): Promise<{
        [key: string]: string;
    }>;
    getTemplate(req: any, templateId: string): Promise<import("./notification-templates.service").NotificationTemplate>;
    createTemplate(req: any, businessId: string, data: CreateNotificationTemplateDto): Promise<import("./notification-templates.service").NotificationTemplate>;
    updateTemplate(req: any, templateId: string, data: UpdateNotificationTemplateDto): Promise<import("./notification-templates.service").NotificationTemplate>;
    deleteTemplate(req: any, templateId: string): Promise<{
        message: string;
    }>;
    processTemplate(templateId: string, variables: {
        [key: string]: string;
    }): Promise<{
        subject?: string;
        message: string;
    }>;
}
