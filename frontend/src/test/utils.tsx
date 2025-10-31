import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ConfigProvider } from '@vkontakte/vkui'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

/**
 * Обертка для рендеринга компонентов с провайдерами VKUI
 */
export function renderWithProviders(ui: ReactNode) {
	function Wrapper({ children }: { children: ReactNode }) {
		return (
			<ConfigProvider>
				{children}
			</ConfigProvider>
		)
	}

	return render(ui, { wrapper: Wrapper })
}

/**
 * Обертка для рендеринга компонентов с Router и VKUI провайдерами
 */
export function renderWithRouter(ui: ReactNode) {
	function Wrapper({ children }: { children: ReactNode }) {
		return (
			<BrowserRouter>
				<ConfigProvider>
					{children}
				</ConfigProvider>
			</BrowserRouter>
		)
	}

	return render(ui, { wrapper: Wrapper })
}

/**
 * Моки для VK Bridge
 */
export const mockVkBridge = {
	send: vi.fn(),
	subscribe: vi.fn(),
	unsubscribe: vi.fn(),
	supports: vi.fn(() => false),
}

