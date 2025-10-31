"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const notification_templates_service_1 = require("./notification-templates.service");
const notification_template_dto_1 = require("./dto/notification-template.dto");
let NotificationTemplatesController = class NotificationTemplatesController {
    notificationTemplatesService;
    constructor(notificationTemplatesService) {
        this.notificationTemplatesService = notificationTemplatesService;
    }
    async getTemplates(req, businessId) {
        return this.notificationTemplatesService.getTemplates(businessId, req.user.id);
    }
    async getAvailableVariables() {
        return this.notificationTemplatesService.getAvailableVariables();
    }
    async getTemplate(req, templateId) {
        return this.notificationTemplatesService.getTemplate(templateId, req.user.id);
    }
    async createTemplate(req, businessId, data) {
        return this.notificationTemplatesService.createTemplate(businessId, req.user.id, data);
    }
    async updateTemplate(req, templateId, data) {
        return this.notificationTemplatesService.updateTemplate(templateId, req.user.id, data);
    }
    async deleteTemplate(req, templateId) {
        await this.notificationTemplatesService.deleteTemplate(templateId, req.user.id);
        return { message: 'Шаблон удален' };
    }
    async processTemplate(templateId, variables) {
        return this.notificationTemplatesService.processTemplate(templateId, variables);
    }
};
exports.NotificationTemplatesController = NotificationTemplatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationTemplatesController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('variables'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationTemplatesController.prototype, "getAvailableVariables", null);
__decorate([
    (0, common_1.Get)(':templateId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationTemplatesController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('businessId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, notification_template_dto_1.CreateNotificationTemplateDto]),
    __metadata("design:returntype", Promise)
], NotificationTemplatesController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Patch)(':templateId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('templateId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, notification_template_dto_1.UpdateNotificationTemplateDto]),
    __metadata("design:returntype", Promise)
], NotificationTemplatesController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)(':templateId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationTemplatesController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Post)(':templateId/process'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationTemplatesController.prototype, "processTemplate", null);
exports.NotificationTemplatesController = NotificationTemplatesController = __decorate([
    (0, common_1.Controller)('api/v1/businesses/:businessId/notification-templates'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [notification_templates_service_1.NotificationTemplatesService])
], NotificationTemplatesController);
//# sourceMappingURL=notification-templates.controller.js.map