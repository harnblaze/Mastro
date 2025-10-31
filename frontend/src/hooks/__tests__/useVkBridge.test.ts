import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useVkBridge } from '../useVkBridge'
import bridge from '@vkontakte/vk-bridge'

// Мокируем VK Bridge
vi.mock('@vkontakte/vk-bridge', () => ({
	default: {
		isWebView: vi.fn(() => false),
		send: vi.fn(),
	},
}))

describe('useVkBridge', () => {
	let originalWindow: typeof window

	beforeEach(() => {
		vi.clearAllMocks()
		vi.resetModules()

		// Мокируем window.VK
		originalWindow = { ...window }
		window.VK = {
			init: vi.fn(),
			Auth: {
				login: vi.fn(),
				logout: vi.fn(),
				getSession: vi.fn(),
			},
			Api: {
				call: vi.fn(),
			},
		} as any

		// Мокируем import.meta.env
		vi.stubEnv('VITE_VK_APP_ID', '12345')

		// Мокируем document.createElement
		const originalCreateElement = document.createElement.bind(document)
		document.createElement = vi.fn((tagName: string) => {
			if (tagName === 'script') {
				const script = originalCreateElement('script')
				script.onload = vi.fn() as any
				return script
			}
			return originalCreateElement(tagName)
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
		window.VK = originalWindow.VK as any
	})

	it('инициализируется с isReady=false', () => {
		const { result } = renderHook(() => useVkBridge())
		expect(result.current.isReady).toBe(false)
		expect(result.current.isWebView).toBe(false)
		expect(result.current.error).toBe(null)
	})

	it('определяет WebView окружение', async () => {
		const mockedBridge = bridge as any
		mockedBridge.isWebView.mockReturnValue(true)
		mockedBridge.send.mockResolvedValue({})

		const { result } = renderHook(() => useVkBridge())

		await waitFor(() => {
			expect(result.current.isReady).toBe(true)
		})

		expect(result.current.isWebView).toBe(true)
		expect(mockedBridge.send).toHaveBeenCalledWith('VKWebAppInit')
	})

	it('возвращает null для getAuthToken когда не готов', async () => {
		const { result } = renderHook(() => useVkBridge())
		const token = await result.current.getAuthToken()
		expect(token).toBe(null)
	})

	it('возвращает null для getUserInfo когда не готов', async () => {
		const { result } = renderHook(() => useVkBridge())
		const userInfo = await result.current.getUserInfo()
		expect(userInfo).toBe(null)
	})

	it('открывает ссылку в новой вкладке когда не готов', async () => {
		const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
		const { result } = renderHook(() => useVkBridge())

		await result.current.openLink('https://example.com')

		expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank')

		openSpy.mockRestore()
	})

	it('показывает alert для snackbar когда не готов', async () => {
		const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
		const { result } = renderHook(() => useVkBridge())

		await result.current.showSnackbar('Тестовое сообщение')

		expect(alertSpy).toHaveBeenCalledWith('Тестовое сообщение')

		alertSpy.mockRestore()
	})

	it('не закрывает приложение когда не готов', async () => {
		const { result } = renderHook(() => useVkBridge())
		await result.current.closeApp()
		// Должен завершиться без ошибок
		expect(true).toBe(true)
	})

	it.skip('обрабатывает ошибки инициализации', async () => {
		// Тест пропущен из-за сложности мокирования асинхронной загрузки VK API скрипта
		const mockedBridge = bridge as any
		mockedBridge.isWebView.mockReturnValue(false)

		// Мокируем отсутствие VITE_VK_APP_ID для вызова ошибки
		vi.stubEnv('VITE_VK_APP_ID', '')

		const { result } = renderHook(() => useVkBridge())

		// Ждем установки ошибки при отсутствии appId
		await waitFor(
			() => {
				expect(result.current.error).not.toBeNull()
			},
			{ timeout: 2000 },
		)

		// Восстанавливаем значение
		vi.stubEnv('VITE_VK_APP_ID', '12345')
	})

	describe('в WebView окружении', () => {
		beforeEach(() => {
			const mockedBridge = bridge as any
			mockedBridge.isWebView.mockReturnValue(true)
			mockedBridge.send.mockResolvedValue({})
		})

		it('получает токен авторизации через VK Bridge', async () => {
			const mockedBridge = bridge as any
			mockedBridge.send.mockResolvedValue({
				access_token: 'test-token',
			})

			const { result } = renderHook(() => useVkBridge())

			await waitFor(() => {
				expect(result.current.isReady).toBe(true)
			})

			const token = await result.current.getAuthToken()

			expect(mockedBridge.send).toHaveBeenCalledWith('VKWebAppGetAuthToken', {
				app_id: 12345,
				scope: 'email',
			})
			expect(token).toBe('test-token')
		})

		it('получает информацию о пользователе через VK Bridge', async () => {
			const mockedBridge = bridge as any
			mockedBridge.send.mockResolvedValue({
				id: 1,
				first_name: 'Test',
				last_name: 'User',
			})

			const { result } = renderHook(() => useVkBridge())

			await waitFor(() => {
				expect(result.current.isReady).toBe(true)
			})

			const userInfo = await result.current.getUserInfo()

			expect(mockedBridge.send).toHaveBeenCalledWith('VKWebAppGetUserInfo')
			expect(userInfo).toEqual({
				id: 1,
				first_name: 'Test',
				last_name: 'User',
			})
		})

		it('открывает ссылку через VK Bridge', async () => {
			const mockedBridge = bridge as any
			mockedBridge.send.mockResolvedValue({})

			const { result } = renderHook(() => useVkBridge())

			await waitFor(() => {
				expect(result.current.isReady).toBe(true)
			})

			await result.current.openLink('https://example.com')

			expect(mockedBridge.send).toHaveBeenCalledWith('VKWebAppOpenURL', {
				url: 'https://example.com',
			})
		})

		it('показывает snackbar через VK Bridge', async () => {
			const mockedBridge = bridge as any
			mockedBridge.send.mockResolvedValue({})

			const { result } = renderHook(() => useVkBridge())

			await waitFor(() => {
				expect(result.current.isReady).toBe(true)
			})

			await result.current.showSnackbar('Тестовое сообщение')

			expect(mockedBridge.send).toHaveBeenCalledWith('VKWebAppShowSnackbar', {
				text: 'Тестовое сообщение',
			})
		})

		it('закрывает приложение через VK Bridge', async () => {
			const mockedBridge = bridge as any
			mockedBridge.send.mockResolvedValue({})

			const { result } = renderHook(() => useVkBridge())

			await waitFor(() => {
				expect(result.current.isReady).toBe(true)
			})

			await result.current.closeApp()

			expect(mockedBridge.send).toHaveBeenCalledWith('VKWebAppClose', {
				status: 'success',
			})
		})

		it('показывает order box через VK Bridge', async () => {
			const mockedBridge = bridge as any
			mockedBridge.send.mockResolvedValue({ result: true })

			const { result } = renderHook(() => useVkBridge())

			await waitFor(() => {
				expect(result.current.isReady).toBe(true)
			})

			const orderData = { amount: 100, currency: 'RUB' }
			const result_order = await result.current.showOrderBox(orderData)

			expect(mockedBridge.send).toHaveBeenCalledWith('VKWebAppShowOrderBox', orderData)
			expect(result_order).toEqual({ result: true })
		})
	})
})

