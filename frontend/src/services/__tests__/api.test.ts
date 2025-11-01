import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import type { AuthResponse, Business, User } from '../../types'

// Мокируем axios
vi.mock('axios', () => {
	const actualAxios = vi.importActual('axios')
	return {
		...actualAxios,
		default: {
			create: vi.fn(),
		},
	}
})

const mockedAxios = axios as any

describe('ApiService', () => {
	let mockApiInstance: any

	beforeEach(() => {
		vi.clearAllMocks()
		vi.resetModules()

		// Мокируем localStorage
		const localStorageMock = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
		}
		;(global as any).localStorage = localStorageMock

		mockApiInstance = {
			interceptors: {
				request: {
					use: vi.fn((fn) => {
						// Сохраняем функцию для последующего использования
						mockApiInstance._requestInterceptor = fn
						return fn
					}),
				},
				response: {
					use: vi.fn((successFn, errorFn) => {
						mockApiInstance._responseInterceptor = {
							successFn,
							errorFn,
						}
						return { successFn, errorFn }
					}),
				},
			},
			get: vi.fn(),
			post: vi.fn(),
			patch: vi.fn(),
			delete: vi.fn(),
		}

		mockedAxios.create.mockReturnValue(mockApiInstance)
	})

	describe('vkAuth', () => {
		it('отправляет запрос на авторизацию через VK', async () => {
			const mockResponse: AuthResponse = {
				access_token: 'token123',
				user: {
					id: '1',
					email: 'test@test.com',
					role: 'OWNER',
				},
			}

			mockApiInstance.post.mockResolvedValue({ data: mockResponse })

			const { ApiService } = await import('../../services/api')
			const service = new ApiService()
			const result = await service.vkAuth('vkToken123')

			expect(mockApiInstance.post).toHaveBeenCalledWith('/auth/vk', {
				vkToken: 'vkToken123',
			})
			expect(result).toEqual(mockResponse)
		})
	})

	describe('login', () => {
		it('отправляет запрос на вход', async () => {
			const mockResponse: AuthResponse = {
				access_token: 'token123',
				user: {
					id: '1',
					email: 'test@test.com',
					role: 'OWNER',
				},
			}

			mockApiInstance.post.mockResolvedValue({ data: mockResponse })

			const { ApiService } = await import('../../services/api')
			const service = new ApiService()
			const result = await service.login('test@test.com', 'password123')

			expect(mockApiInstance.post).toHaveBeenCalledWith('/auth/login', {
				email: 'test@test.com',
				password: 'password123',
			})
			expect(result).toEqual(mockResponse)
		})
	})

	describe('getBusinesses', () => {
		it('получает список бизнесов', async () => {
			const mockBusinesses: Business[] = [
				{
					id: '1',
					name: 'Тестовый бизнес',
					timezone: 'Europe/Moscow',
					createdAt: '2024-01-01T00:00:00Z',
				},
			]

			mockApiInstance.get.mockResolvedValue({ data: mockBusinesses })

			const { ApiService } = await import('../../services/api')
			const service = new ApiService()
			const result = await service.getBusinesses()

			expect(mockApiInstance.get).toHaveBeenCalledWith('/businesses')
			expect(result).toEqual(mockBusinesses)
		})
	})

	describe('getBusiness', () => {
		it('получает бизнес по ID', async () => {
			const mockBusiness: Business = {
				id: '1',
				name: 'Тестовый бизнес',
				timezone: 'Europe/Moscow',
				createdAt: '2024-01-01T00:00:00Z',
			}

			mockApiInstance.get.mockResolvedValue({ data: mockBusiness })

			const { ApiService } = await import('../../services/api')
			const service = new ApiService()
			const result = await service.getBusiness('1')

			expect(mockApiInstance.get).toHaveBeenCalledWith('/businesses/1')
			expect(result).toEqual(mockBusiness)
		})
	})

	describe('createBusiness', () => {
		it('создает новый бизнес', async () => {
			const businessData = {
				name: 'Новый бизнес',
				timezone: 'Europe/Moscow',
			}

			const mockBusiness: Business = {
				id: '1',
				...businessData,
				createdAt: '2024-01-01T00:00:00Z',
			}

			mockApiInstance.post.mockResolvedValue({ data: mockBusiness })

			const { ApiService } = await import('../../services/api')
			const service = new ApiService()
			const result = await service.createBusiness(businessData)

			expect(mockApiInstance.post).toHaveBeenCalledWith(
				'/businesses',
				businessData,
			)
			expect(result).toEqual(mockBusiness)
		})
	})

	describe('updateBusiness', () => {
		it('обновляет бизнес', async () => {
			const updateData = { name: 'Обновленное имя' }
			const mockBusiness: Business = {
				id: '1',
				name: 'Обновленное имя',
				timezone: 'Europe/Moscow',
				createdAt: '2024-01-01T00:00:00Z',
			}

			mockApiInstance.patch.mockResolvedValue({ data: mockBusiness })

			const { ApiService } = await import('../../services/api')
			const service = new ApiService()
			const result = await service.updateBusiness('1', updateData)

			expect(mockApiInstance.patch).toHaveBeenCalledWith(
				'/businesses/1',
				updateData,
			)
			expect(result).toEqual(mockBusiness)
		})
	})

	describe('getProfile', () => {
		it('получает профиль пользователя', async () => {
			const mockUser: User = {
				id: '1',
				email: 'test@test.com',
				role: 'OWNER',
			}

			mockApiInstance.get.mockResolvedValue({ data: mockUser })

			const { ApiService } = await import('../../services/api')
			const service = new ApiService()
			const result = await service.getProfile()

			expect(mockApiInstance.get).toHaveBeenCalledWith('/auth/profile')
			expect(result).toEqual(mockUser)
		})
	})

	describe('interceptors', () => {
		it('добавляет токен авторизации в заголовки', async () => {
			const { ApiService } = await import('../../services/api')
			new ApiService()

			const requestInterceptor = mockApiInstance.interceptors.request.use

			expect(requestInterceptor).toHaveBeenCalled()

			// Проверяем, что перехватчик был установлен
			const interceptorFn = mockApiInstance._requestInterceptor
			;(global as any).localStorage.getItem = vi.fn(() => 'test-token')

			const config = { headers: {} }
			const result = interceptorFn(config)

			expect(result.headers.Authorization).toBe('Bearer test-token')
		})

		it('перенаправляет на /login при 401 ошибке', async () => {
			const { ApiService } = await import('../../services/api')
			new ApiService()

			const responseInterceptor = mockApiInstance.interceptors.response.use

			expect(responseInterceptor).toHaveBeenCalled()

			// Проверяем обработчик ошибок
			const errorHandler = mockApiInstance._responseInterceptor?.errorFn
			const error = {
				response: {
					status: 401,
				},
			}

			const originalLocation = window.location
			delete (window as any).location
			;(window as any).location = { href: '' }

			// Обработчик ошибок отклоняет промис, поэтому нужно обработать это
			await expect(errorHandler(error)).rejects.toEqual(error)

			expect((global as any).localStorage.removeItem).toHaveBeenCalledWith('access_token')
			expect((global as any).localStorage.removeItem).toHaveBeenCalledWith('user')

			Object.defineProperty(window, 'location', {
				value: originalLocation,
				writable: true,
				configurable: true,
			})
		})
	})
})

