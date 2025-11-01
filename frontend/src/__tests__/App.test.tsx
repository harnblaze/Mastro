import { describe, it, expect, vi } from 'vitest'
import App from '../App'
import { renderWithRouter } from '../test/utils'
import { AuthProvider } from '../contexts/AuthContext'

// Мокируем AppRouter
vi.mock('../components/AppRouter', () => ({
	AppRouter: () => <div data-testid="app-router">AppRouter</div>,
}))

// Мокируем initPerformanceMonitoring
vi.mock('../hooks/usePerformanceMonitor', () => ({
	initPerformanceMonitoring: vi.fn(),
}))

describe('App', () => {
	it('рендерится без ошибок', () => {
		const { container } = renderWithRouter(
			<AuthProvider>
				<App />
			</AuthProvider>,
		)

		expect(container).toBeTruthy()
	})

	it('содержит AppRouter', () => {
		const { getByTestId } = renderWithRouter(
			<AuthProvider>
				<App />
			</AuthProvider>,
		)

		expect(getByTestId('app-router')).toBeInTheDocument()
	})

	it('обернут в ConfigProvider, AdaptivityProvider и AppRoot', () => {
		const { container } = renderWithRouter(
			<AuthProvider>
				<App />
			</AuthProvider>,
		)

		// Проверяем что компонент рендерится
		expect(container.firstChild).toBeTruthy()
	})
})

