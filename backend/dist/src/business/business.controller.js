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
exports.BusinessController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const business_service_1 = require("./business.service");
const business_dto_1 = require("./dto/business.dto");
let BusinessController = class BusinessController {
    businessService;
    constructor(businessService) {
        this.businessService = businessService;
    }
    create(req, createBusinessDto) {
        return this.businessService.create(req.user.id, createBusinessDto);
    }
    findAllByOwner(req) {
        return this.businessService.findAllByOwner(req.user.id);
    }
    findOne(req, id) {
        return this.businessService.findOne(id, req.user.id);
    }
    update(req, id, updateBusinessDto) {
        return this.businessService.update(id, req.user.id, updateBusinessDto);
    }
};
exports.BusinessController = BusinessController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Создать бизнес' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Бизнес создан' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Неверные данные' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, business_dto_1.CreateBusinessDto]),
    __metadata("design:returntype", void 0)
], BusinessController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Получить все бизнесы владельца' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список бизнесов' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessController.prototype, "findAllByOwner", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Получить бизнес по ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID бизнеса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Бизнес найден' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Бизнес не найден' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BusinessController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Обновить бизнес' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID бизнеса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Бизнес обновлен' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Бизнес не найден' }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, business_dto_1.UpdateBusinessDto]),
    __metadata("design:returntype", void 0)
], BusinessController.prototype, "update", null);
exports.BusinessController = BusinessController = __decorate([
    (0, swagger_1.ApiTags)('Business'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/businesses'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [business_service_1.BusinessService])
], BusinessController);
//# sourceMappingURL=business.controller.js.map