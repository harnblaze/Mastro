import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

export interface VkUser {
  id: number;
  first_name: string;
  last_name: string;
  photo_200?: string;
  email?: string;
}

interface VkApiResponse {
  response?: VkUser[];
  error?: {
    error_code: number;
    error_msg: string;
  };
}

@Injectable()
export class VkService {
  private readonly vkApiUrl = 'https://api.vk.com/method';

  async validateToken(accessToken: string): Promise<VkUser> {
    try {
      // Для локального тестирования принимаем мок токены
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

      const response = await axios.get<VkApiResponse>(
        `${this.vkApiUrl}/users.get`,
        {
          params: {
            access_token: accessToken,
            fields: 'photo_200,email',
            v: '5.131',
          },
        },
      );

      if (!response.data.response || response.data.response.length === 0) {
        throw new UnauthorizedException('Неверный VK токен');
      }

      const vkUser = response.data.response[0];

      return {
        id: vkUser.id,
        first_name: vkUser.first_name,
        last_name: vkUser.last_name,
        photo_200: vkUser.photo_200,
        email: vkUser.email,
      };
    } catch (error) {
      console.error('VK API error:', error);
      throw new UnauthorizedException('Ошибка валидации VK токена');
    }
  }

  async sendMessage(
    userId: number,
    message: string,
    accessToken: string,
  ): Promise<boolean> {
    try {
      const response = await axios.post<{ response: number }>(
        `${this.vkApiUrl}/messages.send`,
        {
          user_id: userId,
          message: message,
          access_token: accessToken,
          v: '5.131',
        },
      );

      return response.data.response === 1;
    } catch (error) {
      console.error('VK send message error:', error);
      return false;
    }
  }

  async getGroupInfo(groupId: number, accessToken: string): Promise<any> {
    try {
      const response = await axios.get<VkApiResponse>(
        `${this.vkApiUrl}/groups.getById`,
        {
          params: {
            group_id: groupId,
            access_token: accessToken,
            v: '5.131',
          },
        },
      );

      if (!response.data.response || response.data.response.length === 0) {
        return null;
      }

      return response.data.response[0];
    } catch (error) {
      console.error('VK get group info error:', error);
      return null;
    }
  }
}
