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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNotificationTemplateDto = exports.CreateNotificationTemplateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateNotificationTemplateDto {
    type;
    channel;
    subject;
    message;
    isActive;
}
exports.CreateNotificationTemplateDto = CreateNotificationTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Тип шаблона',
        enum: ['CONFIRM', 'REMINDER', 'CANCEL', 'OTHER'],
    }),
    (0, class_validator_1.IsEnum)(['CONFIRM', 'REMINDER', 'CANCEL', 'OTHER']),
    __metadata("design:type", String)
], CreateNotificationTemplateDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Канал уведомления',
        enum: ['SMS', 'EMAIL', 'VK'],
    }),
    (0, class_validator_1.IsEnum)(['SMS', 'EMAIL', 'VK']),
    __metadata("design:type", String)
], CreateNotificationTemplateDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Тема сообщения', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationTemplateDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Текст сообщения' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationTemplateDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Активен ли шаблон', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNotificationTemplateDto.prototype, "isActive", void 0);
class UpdateNotificationTemplateDto {
    subject;
    message;
    isActive;
}
exports.UpdateNotificationTemplateDto = UpdateNotificationTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Тема сообщения', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateNotificationTemplateDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Текст сообщения', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateNotificationTemplateDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Активен ли шаблон', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationTemplateDto.prototype, "isActive", void 0);
//# sourceMappingURL=notification-template.dto.js.map