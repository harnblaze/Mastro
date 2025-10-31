"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const business_module_1 = require("./business/business.module");
const services_module_1 = require("./services/services.module");
const staff_module_1 = require("./staff/staff.module");
const bookings_module_1 = require("./bookings/bookings.module");
const clients_module_1 = require("./clients/clients.module");
const notifications_module_1 = require("./notifications/notifications.module");
const notification_templates_module_1 = require("./notification-templates/notification-templates.module");
const availability_module_1 = require("./availability/availability.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            business_module_1.BusinessModule,
            services_module_1.ServicesModule,
            staff_module_1.StaffModule,
            bookings_module_1.BookingsModule,
            clients_module_1.ClientsModule,
            notifications_module_1.NotificationsModule,
            notification_templates_module_1.NotificationTemplatesModule,
            availability_module_1.AvailabilityModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map