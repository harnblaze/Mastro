import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { VkService, VkUser } from './vk.service';
import axios from 'axios';

describe('VkService', () => {
  let service: VkService;
  let axiosGetSpy: jest.SpyInstance;
  let axiosPostSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VkService],
    }).compile();

    service = module.get<VkService>(VkService);

    // Сбрасываем все моки перед каждым тестом
    jest.clearAllMocks();

    // Создаем spy для axios методов
    axiosGetSpy = jest.spyOn(axios, 'get');
    axiosPostSpy = jest.spyOn(axios, 'post');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateToken', () => {
    const accessToken = 'test-access-token';

    it('должен успешно валидировать токен и вернуть данные пользователя', async () => {
      const accessToken = 'test-access-token';
      const mockVkResponse = {
        data: {
          response: [
            {
              id: 123456789,
              first_name: 'Иван',
              last_name: 'Петров',
              photo_200: 'https://example.com/photo.jpg',
              email: 'ivan@example.com',
            },
          ],
        },
      };

      axiosGetSpy.mockResolvedValue(mockVkResponse);

      const result = await service.validateToken(accessToken);

      expect(axiosGetSpy).toHaveBeenCalledWith(
        'https://api.vk.com/method/users.get',
        {
          params: {
            access_token: accessToken,
            fields: 'photo_200,email',
            v: '5.131',
          },
        },
      );

      expect(result).toEqual({
        id: 123456789,
        first_name: 'Иван',
        last_name: 'Петров',
        photo_200: 'https://example.com/photo.jpg',
        email: 'ivan@example.com',
      });
    });

    it('должен обработать пользователя без email', async () => {
      const accessToken = 'test-access-token';
      const mockVkResponse = {
        data: {
          response: [
            {
              id: 987654321,
              first_name: 'Анна',
              last_name: 'Сидорова',
              photo_200: 'https://example.com/photo2.jpg',
            },
          ],
        },
      };

      axiosGetSpy.mockResolvedValue(mockVkResponse);

      const result = await service.validateToken(accessToken);

      expect(result).toEqual({
        id: 987654321,
        first_name: 'Анна',
        last_name: 'Сидорова',
        photo_200: 'https://example.com/photo2.jpg',
        email: undefined,
      });
    });

    it('должен выбросить UnauthorizedException при пустом ответе', async () => {
      const mockVkResponse = {
        data: {
          response: [],
        },
      };

      axiosGetSpy.mockResolvedValue(mockVkResponse);

      await expect(service.validateToken(accessToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('должен выбросить UnauthorizedException при отсутствии response', async () => {
      const mockVkResponse = {
        data: {},
      };

      axiosGetSpy.mockResolvedValue(mockVkResponse);

      await expect(service.validateToken(accessToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('должен выбросить UnauthorizedException при ошибке API', async () => {
      axiosGetSpy.mockRejectedValue(new Error('Network error'));

      await expect(service.validateToken(accessToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('должен выбросить UnauthorizedException при ошибке валидации токена', async () => {
      const mockVkErrorResponse = {
        data: {
          error: {
            error_code: 5,
            error_msg: 'User authorization failed',
          },
        },
      };

      axiosGetSpy.mockResolvedValue(mockVkErrorResponse);

      await expect(service.validateToken(accessToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('sendMessage', () => {
    const userId = 123456789;
    const message = 'Тестовое сообщение';
    const accessToken = 'test-access-token';

    it('должен успешно отправить сообщение', async () => {
      const userId = 123456789;
      const message = 'Тестовое сообщение';
      const accessToken = 'test-access-token';
      const mockVkResponse = {
        data: {
          response: 1, // Успешная отправка
        },
      };

      axiosPostSpy.mockResolvedValue(mockVkResponse);

      const result = await service.sendMessage(userId, message, accessToken);

      expect(axiosPostSpy).toHaveBeenCalledWith(
        'https://api.vk.com/method/messages.send',
        {
          user_id: userId,
          message: message,
          access_token: accessToken,
          v: '5.131',
        },
      );

      expect(result).toBe(true);
    });

    it('должен вернуть false при неуспешной отправке', async () => {
      const mockVkResponse = {
        data: {
          response: 0, // Неуспешная отправка
        },
      };

      axiosPostSpy.mockResolvedValue(mockVkResponse);

      const result = await service.sendMessage(userId, message, accessToken);

      expect(result).toBe(false);
    });

    it('должен вернуть false при ошибке API', async () => {
      axiosPostSpy.mockRejectedValue(new Error('Network error'));

      const result = await service.sendMessage(userId, message, accessToken);

      expect(result).toBe(false);
    });

    it('должен вернуть false при ошибке отправки сообщения', async () => {
      const mockVkErrorResponse = {
        data: {
          error: {
            error_code: 7,
            error_msg: 'Permission to perform this action is denied',
          },
        },
      };

      axiosPostSpy.mockResolvedValue(mockVkErrorResponse);

      const result = await service.sendMessage(userId, message, accessToken);

      expect(result).toBe(false);
    });
  });

  describe('getGroupInfo', () => {
    const groupId = 123456789;
    const accessToken = 'test-access-token';

    it('должен успешно получить информацию о группе', async () => {
      const groupId = 123456789;
      const accessToken = 'test-access-token';
      const mockGroupInfo = {
        id: groupId,
        name: 'Тестовая группа',
        screen_name: 'test_group',
        type: 'group',
        photo_200: 'https://example.com/group_photo.jpg',
      };

      const mockVkResponse = {
        data: {
          response: [mockGroupInfo],
        },
      };

      axiosGetSpy.mockResolvedValue(mockVkResponse);

      const result = await service.getGroupInfo(groupId, accessToken);

      expect(axiosGetSpy).toHaveBeenCalledWith(
        'https://api.vk.com/method/groups.getById',
        {
          params: {
            group_id: groupId,
            access_token: accessToken,
            v: '5.131',
          },
        },
      );

      expect(result).toEqual(mockGroupInfo);
    });

    it('должен вернуть null при ошибке API', async () => {
      axiosGetSpy.mockRejectedValue(new Error('Network error'));

      const result = await service.getGroupInfo(groupId, accessToken);

      expect(result).toBeNull();
    });

    it('должен вернуть null при ошибке получения информации о группе', async () => {
      const mockVkErrorResponse = {
        data: {
          error: {
            error_code: 100,
            error_msg: 'One of the parameters specified was missing or invalid',
          },
        },
      };

      axiosGetSpy.mockResolvedValue(mockVkErrorResponse);

      const result = await service.getGroupInfo(groupId, accessToken);

      expect(result).toBeNull();
    });

    it('должен вернуть null при пустом ответе', async () => {
      const mockVkResponse = {
        data: {
          response: [],
        },
      };

      axiosGetSpy.mockResolvedValue(mockVkResponse);

      const result = await service.getGroupInfo(groupId, accessToken);

      expect(result).toBeNull();
    });
  });

  describe('VkUser interface', () => {
    it('должен соответствовать интерфейсу VkUser', () => {
      const vkUser: VkUser = {
        id: 123456789,
        first_name: 'Иван',
        last_name: 'Петров',
        photo_200: 'https://example.com/photo.jpg',
        email: 'ivan@example.com',
      };

      expect(vkUser.id).toBe(123456789);
      expect(vkUser.first_name).toBe('Иван');
      expect(vkUser.last_name).toBe('Петров');
      expect(vkUser.photo_200).toBe('https://example.com/photo.jpg');
      expect(vkUser.email).toBe('ivan@example.com');
    });

    it('должен работать без опциональных полей', () => {
      const vkUser: VkUser = {
        id: 987654321,
        first_name: 'Анна',
        last_name: 'Сидорова',
      };

      expect(vkUser.id).toBe(987654321);
      expect(vkUser.first_name).toBe('Анна');
      expect(vkUser.last_name).toBe('Сидорова');
      expect(vkUser.photo_200).toBeUndefined();
      expect(vkUser.email).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('должен логировать ошибки в консоль', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      axiosGetSpy.mockRejectedValue(new Error('Test error'));

      try {
        await service.validateToken('invalid-token');
      } catch (error) {
        // Ожидаем исключение
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'VK API error:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it('должен логировать ошибки отправки сообщений', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      axiosPostSpy.mockRejectedValue(new Error('Send message error'));

      await service.sendMessage(123, 'test', 'token');

      expect(consoleSpy).toHaveBeenCalledWith(
        'VK send message error:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it('должен логировать ошибки получения информации о группе', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      axiosGetSpy.mockRejectedValue(new Error('Group info error'));

      await service.getGroupInfo(123, 'token');

      expect(consoleSpy).toHaveBeenCalledWith(
        'VK get group info error:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });
});
