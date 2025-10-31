import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VkBridgeDemo } from '../VkBridgeDemo'
import { renderWithProviders } from '../../test/utils'

// Мокируем VK Bridge
vi.mock('@vkontakte/vk-bridge', () => ({
	default: {
		send: vi.fn(),
	},
}))

import bridge from '@vkontakte/vk-bridge'

const mockBridgeSend = vi.mocked(bridge.send)

describe('VkBridgeDemo', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('отображает заголовок', () => {
		renderWithProviders(<VkBridgeDemo />)
		expect(screen.getByText('VK Bridge Demo')).toBeInTheDocument()
	})

	it('отображает статус "Веб-режим" когда не запущено в VK', async () => {
		mockBridgeSend.mockRejectedValue(new Error('Not in VK'))

		renderWithProviders(<VkBridgeDemo />)

		await waitFor(() => {
			expect(screen.getByText(/Веб-режим/)).toBeInTheDocument()
		})
	})

	it('отображает статус "Запущено в VK" когда запущено в VK', async () => {
		mockBridgeSend.mockResolvedValue({ vk_user_id: '123' })

		renderWithProviders(<VkBridgeDemo />)

		await waitFor(() => {
			expect(screen.getByText(/Запущено в VK/)).toBeInTheDocument()
		})
	})

	it('отображает параметры запуска когда они получены', async () => {
		const launchParams = { vk_user_id: '123', vk_app_id: '456' }
		mockBridgeSend.mockResolvedValue(launchParams)

		renderWithProviders(<VkBridgeDemo />)

		await waitFor(() => {
			expect(screen.getByText(/Параметры запуска/)).toBeInTheDocument()
		})
	})

	it('отображает кнопки VK авторизации и поделиться когда запущено в VK', async () => {
		mockBridgeSend.mockResolvedValue({ vk_user_id: '123' })

		renderWithProviders(<VkBridgeDemo />)

		await waitFor(() => {
			expect(screen.getByText('VK Авторизация')).toBeInTheDocument()
			expect(screen.getByText('Поделиться')).toBeInTheDocument()
		})
	})

	it('не отображает кнопки когда не запущено в VK', async () => {
		mockBridgeSend.mockRejectedValue(new Error('Not in VK'))

		renderWithProviders(<VkBridgeDemo />)

		await waitFor(() => {
			expect(screen.queryByText('VK Авторизация')).not.toBeInTheDocument()
			expect(screen.queryByText('Поделиться')).not.toBeInTheDocument()
		})
	})

	it('вызывает VK авторизацию при клике на кнопку', async () => {
		mockBridgeSend.mockResolvedValue({ vk_user_id: '123' })

		renderWithProviders(<VkBridgeDemo />)

		await waitFor(() => {
			expect(screen.getByText('VK Авторизация')).toBeInTheDocument()
		})

		const authButton = screen.getByText('VK Авторизация')
		await userEvent.click(authButton)

		await waitFor(() => {
			expect(mockBridgeSend).toHaveBeenCalledWith('VKWebAppGetAuthToken', {
				app_id: expect.any(Number),
				scope: 'email',
			})
		})
	})

	it('вызывает поделиться при клике на кнопку', async () => {
		mockBridgeSend.mockResolvedValue({ vk_user_id: '123' })

		renderWithProviders(<VkBridgeDemo />)

		await waitFor(() => {
			expect(screen.getByText('Поделиться')).toBeInTheDocument()
		})

		const shareButton = screen.getByText('Поделиться')
		await userEvent.click(shareButton)

		await waitFor(() => {
			expect(mockBridgeSend).toHaveBeenCalledWith('VKWebAppShare', {
				link: window.location.href,
			})
		})
	})

	it('обрабатывает ошибки VK авторизации', async () => {
		mockBridgeSend
			.mockResolvedValueOnce({ vk_user_id: '123' }) // Для checkVkEnvironment
			.mockRejectedValueOnce(new Error('Auth failed')) // Для handleVkAuth

		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		renderWithProviders(<VkBridgeDemo />)

		await waitFor(() => {
			expect(screen.getByText('VK Авторизация')).toBeInTheDocument()
		})

		const authButton = screen.getByText('VK Авторизация')
		await userEvent.click(authButton)

		await waitFor(() => {
			expect(consoleErrorSpy).toHaveBeenCalled()
		})

		consoleErrorSpy.mockRestore()
	})

	it('обрабатывает ошибки поделиться', async () => {
		mockBridgeSend
			.mockResolvedValueOnce({ vk_user_id: '123' }) // Для checkVkEnvironment
			.mockRejectedValueOnce(new Error('Share failed')) // Для handleShare

		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		renderWithProviders(<VkBridgeDemo />)

		await waitFor(() => {
			expect(screen.getByText('Поделиться')).toBeInTheDocument()
		})

		const shareButton = screen.getByText('Поделиться')
		await userEvent.click(shareButton)

		await waitFor(() => {
			expect(consoleErrorSpy).toHaveBeenCalled()
		})

		consoleErrorSpy.mockRestore()
	})
})
