import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificationTemplate {
  id: string;
  businessId: string;
  type: 'CONFIRM' | 'REMINDER' | 'CANCEL' | 'OTHER';
  channel: 'SMS' | 'EMAIL' | 'VK';
  subject?: string; // Для email
  message: string;
  variables: string[]; // Список доступных переменных
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

@Injectable()
export class NotificationTemplatesService {
  constructor(private prisma: PrismaService) {}

  async getTemplates(
    businessId: string,
    userId: string,
  ): Promise<NotificationTemplate[]> {
    // Проверяем права доступа к бизнесу
    const business = await this.prisma.business.findFirst({
      where: {
        id: businessId,
        OR: [{ ownerId: userId }, { staff: { some: { userId } } }],
      },
    });

    if (!business) {
      throw new ForbiddenException('Нет доступа к этому бизнесу');
    }

    const templates = await this.prisma.notificationTemplate.findMany({
      where: { businessId },
      orderBy: [{ type: 'asc' }, { channel: 'asc' }],
    });

    return templates.map((template) => ({
      id: template.id,
      businessId: template.businessId,
      type: template.type as any,
      channel: template.channel as any,
      subject: template.subject || undefined,
      message: template.message,
      variables: this.extractVariables(template.message),
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    }));
  }

  async getTemplate(
    templateId: string,
    userId: string,
  ): Promise<NotificationTemplate> {
    const template = await this.prisma.notificationTemplate.findFirst({
      where: { id: templateId },
      include: {
        business: {
          select: {
            ownerId: true,
            staff: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Шаблон не найден');
    }

    const hasAccess =
      template.business.ownerId === userId ||
      template.business.staff.some((staff) => staff.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к этому шаблону');
    }

    return {
      id: template.id,
      businessId: template.businessId,
      type: template.type as any,
      channel: template.channel as any,
      subject: template.subject || undefined,
      message: template.message,
      variables: this.extractVariables(template.message),
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  async createTemplate(
    businessId: string,
    userId: string,
    data: CreateNotificationTemplateDto,
  ): Promise<NotificationTemplate> {
    // Проверяем права доступа
    const business = await this.prisma.business.findFirst({
      where: {
        id: businessId,
        OR: [{ ownerId: userId }, { staff: { some: { userId } } }],
      },
    });

    if (!business) {
      throw new ForbiddenException('Нет доступа к этому бизнесу');
    }

    // Проверяем, нет ли уже такого шаблона
    const existingTemplate = await this.prisma.notificationTemplate.findFirst({
      where: {
        businessId,
        type: data.type,
        channel: data.channel,
      },
    });

    if (existingTemplate) {
      throw new ForbiddenException(
        'Шаблон для этого типа и канала уже существует',
      );
    }

    const template = await this.prisma.notificationTemplate.create({
      data: {
        businessId,
        type: data.type,
        channel: data.channel,
        subject: data.subject,
        message: data.message,
        isActive: data.isActive ?? true,
      },
    });

    return {
      id: template.id,
      businessId: template.businessId,
      type: template.type as any,
      channel: template.channel as any,
      subject: template.subject || undefined,
      message: template.message,
      variables: this.extractVariables(template.message),
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  async updateTemplate(
    templateId: string,
    userId: string,
    data: UpdateNotificationTemplateDto,
  ): Promise<NotificationTemplate> {
    const template = await this.prisma.notificationTemplate.findFirst({
      where: { id: templateId },
      include: {
        business: {
          select: {
            ownerId: true,
            staff: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Шаблон не найден');
    }

    const hasAccess =
      template.business.ownerId === userId ||
      template.business.staff.some((staff) => staff.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к этому шаблону');
    }

    const updatedTemplate = await this.prisma.notificationTemplate.update({
      where: { id: templateId },
      data: {
        subject: data.subject,
        message: data.message,
        isActive: data.isActive,
      },
    });

    return {
      id: updatedTemplate.id,
      businessId: updatedTemplate.businessId,
      type: updatedTemplate.type as any,
      channel: updatedTemplate.channel as any,
      subject: updatedTemplate.subject || undefined,
      message: updatedTemplate.message,
      variables: this.extractVariables(updatedTemplate.message),
      isActive: updatedTemplate.isActive,
      createdAt: updatedTemplate.createdAt.toISOString(),
      updatedAt: updatedTemplate.updatedAt.toISOString(),
    };
  }

  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const template = await this.prisma.notificationTemplate.findFirst({
      where: { id: templateId },
      include: {
        business: {
          select: {
            ownerId: true,
            staff: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Шаблон не найден');
    }

    const hasAccess =
      template.business.ownerId === userId ||
      template.business.staff.some((staff) => staff.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к этому шаблону');
    }

    await this.prisma.notificationTemplate.delete({
      where: { id: templateId },
    });
  }

  async getAvailableVariables(): Promise<{ [key: string]: string }> {
    return {
      '{business_name}': 'Название бизнеса',
      '{client_name}': 'Имя клиента',
      '{client_phone}': 'Телефон клиента',
      '{service_name}': 'Название услуги',
      '{service_price}': 'Цена услуги',
      '{staff_name}': 'Имя мастера',
      '{date}': 'Дата записи',
      '{time}': 'Время записи',
      '{duration}': 'Длительность услуги',
      '{address}': 'Адрес бизнеса',
      '{phone}': 'Телефон бизнеса',
    };
  }

  async processTemplate(
    templateId: string,
    variables: { [key: string]: string },
  ): Promise<{ subject?: string; message: string }> {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Шаблон не найден');
    }

    let processedMessage = template.message;
    let processedSubject = template.subject;

    // Заменяем переменные в сообщении
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      processedMessage = processedMessage.replace(
        new RegExp(placeholder, 'g'),
        value,
      );
      if (processedSubject) {
        processedSubject = processedSubject.replace(
          new RegExp(placeholder, 'g'),
          value,
        );
      }
    });

    return {
      subject: processedSubject || undefined,
      message: processedMessage,
    };
  }

  private extractVariables(message: string): string[] {
    const variableRegex = /\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(message)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }
}
