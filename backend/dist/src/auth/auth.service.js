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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const vk_service_1 = require("./vk.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    vkService;
    constructor(prisma, jwtService, vkService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.vkService = vkService;
    }
    async validateVkAuth(vkAuthDto) {
        try {
            const vkUser = await this.vkService.validateToken(vkAuthDto.vkToken);
            let user = await this.prisma.user.findUnique({
                where: { vkId: vkUser.id.toString() },
            });
            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        vkId: vkUser.id.toString(),
                        email: vkUser.email || `${vkUser.id}@vk.local`,
                        role: 'OWNER',
                    },
                });
            }
            return this.generateTokens(user);
        }
        catch (error) {
            console.error('VK Auth error:', error);
            throw new common_1.UnauthorizedException('Ошибка авторизации через VK');
        }
    }
    async login(loginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Неверные учетные данные');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Неверные учетные данные');
        }
        return this.generateTokens(user);
    }
    async register(createUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: createUserDto.email,
                passwordHash: hashedPassword,
                vkId: createUserDto.vkId,
                role: createUserDto.role || 'OWNER',
            },
        });
        return this.generateTokens(user);
    }
    generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            vkId: user.vkId,
        };
        const token = this.jwtService.sign(payload);
        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                vkId: user.vkId,
            },
        };
    }
    async validateUser(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Пользователь не найден');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        vk_service_1.VkService])
], AuthService);
//# sourceMappingURL=auth.service.js.map