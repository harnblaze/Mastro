"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VkService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let VkService = class VkService {
    vkApiUrl = 'https://api.vk.com/method';
    async validateToken(accessToken) {
        try {
            if (accessToken.startsWith('mock-vk-token-')) {
                console.log('🧪 Using mock VK user for testing');
                return {
                    id: 12345,
                    first_name: 'Тест',
                    last_name: 'Пользователь',
                    photo_200: 'https://via.placeholder.com/200',
                    email: 'test@example.com',
                };
            }
            const response = await axios_1.default.get(`${this.vkApiUrl}/users.get`, {
                params: {
                    access_token: accessToken,
                    fields: 'photo_200,email',
                    v: '5.131',
                },
            });
            if (!response.data.response || response.data.response.length === 0) {
                throw new common_1.UnauthorizedException('Неверный VK токен');
            }
            const vkUser = response.data.response[0];
            return {
                id: vkUser.id,
                first_name: vkUser.first_name,
                last_name: vkUser.last_name,
                photo_200: vkUser.photo_200,
                email: vkUser.email,
            };
        }
        catch (error) {
            console.error('VK API error:', error);
            throw new common_1.UnauthorizedException('Ошибка валидации VK токена');
        }
    }
    async sendMessage(userId, message, accessToken) {
        try {
            const response = await axios_1.default.post(`${this.vkApiUrl}/messages.send`, {
                user_id: userId,
                message: message,
                access_token: accessToken,
                v: '5.131',
            });
            return response.data.response === 1;
        }
        catch (error) {
            console.error('VK send message error:', error);
            return false;
        }
    }
    async getGroupInfo(groupId, accessToken) {
        try {
            const response = await axios_1.default.get(`${this.vkApiUrl}/groups.getById`, {
                params: {
                    group_id: groupId,
                    access_token: accessToken,
                    v: '5.131',
                },
            });
            if (!response.data.response || response.data.response.length === 0) {
                return null;
            }
            return response.data.response[0];
        }
        catch (error) {
            console.error('VK get group info error:', error);
            return null;
        }
    }
};
exports.VkService = VkService;
exports.VkService = VkService = __decorate([
    (0, common_1.Injectable)()
], VkService);
//# sourceMappingURL=vk.service.js.map