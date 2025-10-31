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
exports.AvailabilityQueryDto = exports.CreateAvailabilityExceptionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateAvailabilityExceptionDto {
    date;
    startTime;
    endTime;
    type;
    reason;
}
exports.CreateAvailabilityExceptionDto = CreateAvailabilityExceptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Дата исключения (ISO строка)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAvailabilityExceptionDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Время начала (HH:mm)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAvailabilityExceptionDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Время окончания (HH:mm)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAvailabilityExceptionDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Тип исключения',
        enum: ['CLOSED', 'OPEN_CUSTOM'],
    }),
    (0, class_validator_1.IsEnum)(['CLOSED', 'OPEN_CUSTOM']),
    __metadata("design:type", String)
], CreateAvailabilityExceptionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Причина исключения', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAvailabilityExceptionDto.prototype, "reason", void 0);
class AvailabilityQueryDto {
    date;
    serviceId;
    staffId;
}
exports.AvailabilityQueryDto = AvailabilityQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Дата для проверки доступности (ISO строка)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AvailabilityQueryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID услуги', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AvailabilityQueryDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID сотрудника', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AvailabilityQueryDto.prototype, "staffId", void 0);
//# sourceMappingURL=availability.dto.js.map