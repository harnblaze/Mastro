import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { apiService } from '../../services/api'
import type { AuthResponse, User } from '../../types'

// Мокируем apiService
vi.mock('../../services/api', () => ({
	apiService: {
		getProfile: vi.fn(),
		login: vi.fn(),
		register: vi.fn(),
		vkAuth: vi.fn(),
	},
}))

const mockApiService = apiService as any

describe('AuthContext', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Мокируем localStorage правильно
		const localStorageMock = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
		}
		;(global as any).localStorage = localStorageMock
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('бросает ошибку при использовании вне провайдера', () => {
		// Подавляем ошибку в консоли во время теста
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

		expect(() => {
			renderHook(() => useAuth())
		}).toThrow('useAuth must be used within an AuthProvider')

		consoleError.mockRestore()
	})

	it('инициализируется и заканчивает загрузку', async () => {
		mockApiService.getProfile.mockResolvedValue(null)
		;(global as any).localStorage.getItem = vi.fn(() => null)

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		})

		// isLoading должен стать false после инициализации
		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		}, { timeout: 2000 })

		expect(result.current.isAuthenticated).toBe(false)
	})

	it('устанавливает пользователя из localStorage если токен валиден', async () => {
		const mockUser: User = {
			id: '1',
			email: 'test@test.com',
			role: 'OWNER',
		}

		;(global as any).localStorage.getItem = vi.fn((key: string) => {
			if (key === 'access_token') return 'valid-token'
			if (key === 'user') return JSON.stringify(mockUser)
			return null
		})

		mockApiService.getProfile.mockResolvedValue(mockUser)

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		}, { timeout: 2000 })

		await waitFor(() => {
			expect(result.current.user).toEqual(mockUser)
		}, { timeout: 2000 })

		expect(result.current.isAuthenticated).toBe(true)
	})

	it('очищает localStorage при невалидном токене', async () => {
		const removeItemSpy = vi.fn()
		;(global as any).localStorage.getItem = vi.fn((key: string) => {
			if (key === 'access_token') return 'invalid-token'
			if (key === 'user') return JSON.stringify({ id: '1' })
			return null
		})
		;(global as any).localStorage.removeItem = removeItemSpy

		mockApiService.getProfile.mockRejectedValue(new Error('Unauthorized'))

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		}, { timeout: 2000 })

		expect(result.current.user).toBe(null)
		expect(result.current.isAuthenticated).toBe(false)
		expect(removeItemSpy).toHaveBeenCalledWith('access_token')
		expect(removeItemSpy).toHaveBeenCalledWith('user')
	})

	it('выполняет login и сохраняет данные', async () => {
		const mockAuthResponse: AuthResponse = {
			access_token: 'new-token',
			user: {
				id: '1',
				email: 'test@test.com',
				role: 'OWNER',
			},
		}

		mockApiService.login.mockResolvedValue(mockAuthResponse)
		;(global as any).localStorage.getItem = vi.fn(() => null)
		const setItemSpy = vi.fn()
		;(global as any).localStorage.setItem = setItemSpy

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		}, { timeout: 2000 })

		await act(async () => {
			await result.current.login('test@test.com', 'password')
		})

		expect(mockApiService.login).toHaveBeenCalledWith(
			'test@test.com',
			'password',
		)
		expect(result.current.user).toEqual(mockAuthResponse.user)
		expect(result.current.isAuthenticated).toBe(true)
		expect(setItemSpy).toHaveBeenCalledWith('access_token', 'new-token')
		expect(setItemSpy).toHaveBeenCalledWith('user', JSON.stringify(mockAuthResponse.user))
	})

	it('выполняет register и сохраняет данные', async () => {
		const mockAuthResponse: AuthResponse = {
			access_token: 'new-token',
			user: {
				id: '1',
				email: 'test@test.com',
				role: 'OWNER',
			},
		}

		mockApiService.register.mockResolvedValue(mockAuthResponse)
		;(global as any).localStorage.getItem = vi.fn(() => null)
		const setItemSpy = vi.fn()
		;(global as any).localStorage.setItem = setItemSpy

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		}, { timeout: 2000 })

		await act(async () => {
			await result.current.register('test@test.com', 'password')
		})

		expect(mockApiService.register).toHaveBeenCalledWith(
			'test@test.com',
			'password',
		)
		expect(result.current.user).toEqual(mockAuthResponse.user)
		expect(setItemSpy).toHaveBeenCalledWith('access_token', 'new-token')
	})

	it('выполняет vkAuth и сохраняет данные', async () => {
		const mockAuthResponse: AuthResponse = {
			access_token: 'vk-token',
			user: {
				id: '1',
				email: 'test@test.com',
				role: 'OWNER',
				vkId: '123456',
			},
		}

		mockApiService.vkAuth.mockResolvedValue(mockAuthResponse)
		;(global as any).localStorage.getItem = vi.fn(() => null)
		const setItemSpy = vi.fn()
		;(global as any).localStorage.setItem = setItemSpy

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		}, { timeout: 2000 })

		await act(async () => {
			await result.current.vkAuth('vk-token-123')
		})

		expect(mockApiService.vkAuth).toHaveBeenCalledWith('vk-token-123')
		expect(result.current.user).toEqual(mockAuthResponse.user)
		expect(setItemSpy).toHaveBeenCalledWith('access_token', 'vk-token')
	})

	it('выполняет logout и очищает данные', async () => {
		const mockUser: User = {
			id: '1',
			email: 'test@test.com',
			role: 'OWNER',
		}

		;(global as any).localStorage.getItem = vi.fn((key: string) => {
			if (key === 'access_token') return 'token'
			if (key === 'user') return JSON.stringify(mockUser)
			return null
		})
		const removeItemSpy = vi.fn()
		;(global as any).localStorage.removeItem = removeItemSpy

		mockApiService.getProfile.mockResolvedValue(mockUser)

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		}, { timeout: 2000 })

		await waitFor(() => {
			expect(result.current.user).toEqual(mockUser)
		}, { timeout: 2000 })

		act(() => {
			result.current.logout()
		})

		expect(result.current.user).toBe(null)
		expect(result.current.isAuthenticated).toBe(false)
		expect(removeItemSpy).toHaveBeenCalledWith('access_token')
		expect(removeItemSpy).toHaveBeenCalledWith('user')
	})

	it('isAuthenticated возвращает false когда пользователь отсутствует', async () => {
		mockApiService.getProfile.mockResolvedValue(null)

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		})

		expect(result.current.isAuthenticated).toBe(false)
	})

	it('isAuthenticated возвращает true когда пользователь установлен', async () => {
		const mockUser: User = {
			id: '1',
			email: 'test@test.com',
			role: 'OWNER',
		}

		const mockAuthResponse: AuthResponse = {
			access_token: 'token',
			user: mockUser,
		}

		mockApiService.login.mockResolvedValue(mockAuthResponse)
		mockApiService.getProfile.mockResolvedValue(null)

		const { result } = renderHook(() => useAuth(), {
			wrapper: AuthProvider,
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		})

		await act(async () => {
			await result.current.login('test@test.com', 'password')
		})

		expect(result.current.isAuthenticated).toBe(true)
	})
})

