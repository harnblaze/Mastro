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
exports.AvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const availability_service_1 = require("./availability.service");
let AvailabilityController = class AvailabilityController {
    availabilityService;
    constructor(availabilityService) {
        this.availabilityService = availabilityService;
    }
    async getAvailability(req, businessId, date, serviceId, staffId) {
        return this.availabilityService.getBusinessAvailability(businessId, req.user.id, date, serviceId, staffId);
    }
    async getExceptions(req, businessId, from, to) {
        return this.availabilityService.getAvailabilityExceptions(businessId, req.user.id, from, to);
    }
    async createException(req, businessId, data) {
        return this.availabilityService.createAvailabilityException(businessId, req.user.id, data);
    }
    async deleteException(req, exceptionId) {
        return this.availabilityService.deleteAvailabilityException(exceptionId, req.user.id);
    }
};
exports.AvailabilityController = AvailabilityController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('businessId')),
    __param(2, (0, common_1.Query)('date')),
    __param(3, (0, common_1.Query)('serviceId')),
    __param(4, (0, common_1.Query)('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Get)('exceptions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('businessId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getExceptions", null);
__decorate([
    (0, common_1.Post)('exceptions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('businessId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "createException", null);
__decorate([
    (0, common_1.Delete)('exceptions/:exceptionId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('exceptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "deleteException", null);
exports.AvailabilityController = AvailabilityController = __decorate([
    (0, common_1.Controller)('api/v1/businesses/:businessId/availability'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [availability_service_1.AvailabilityService])
], AvailabilityController);
//# sourceMappingURL=availability.controller.js.map