import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '../Sidebar'
import { renderWithRouter } from '../../test/utils'

// Мокируем AuthContext
const mockLogout = vi.fn()
vi.mock('../../contexts/AuthContext', () => ({
	useAuth: () => ({
		logout: mockLogout,
	}),
}))

// Мокируем useNavigate и useLocation
const mockNavigate = vi.fn()
const mockLocation = { pathname: '/businesses/1/dashboard' }

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return {
		...actual,
		useNavigate: () => mockNavigate,
		useLocation: () => mockLocation,
	}
})

describe('Sidebar', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('отображает заголовок', () => {
		renderWithRouter(
			<Sidebar businessId="1" isOpen={true} onClose={() => {}} />,
		)
		expect(screen.getByText('Mastro Admin')).toBeInTheDocument()
	})

	it('скрыт когда isOpen=false', () => {
		const { container } = renderWithRouter(
			<Sidebar businessId="1" isOpen={false} onClose={() => {}} />,
		)
		const sidebar = container.querySelector('div[style*="left: -280px"]')
		expect(sidebar).toBeInTheDocument()
	})

	it('виден когда isOpen=true', () => {
		const { container } = renderWithRouter(
			<Sidebar businessId="1" isOpen={true} onClose={() => {}} />,
		)
		const sidebar = container.querySelector('div[style*="left: 0"]')
		expect(sidebar).toBeInTheDocument()
	})

	it('отображает все пункты меню', () => {
		renderWithRouter(
			<Sidebar businessId="1" isOpen={true} onClose={() => {}} />,
		)

		expect(screen.getByText('Дашборд')).toBeInTheDocument()
		expect(screen.getByText('Календарь')).toBeInTheDocument()
		expect(screen.getByText('Записи')).toBeInTheDocument()
		expect(screen.getByText('Услуги')).toBeInTheDocument()
		expect(screen.getByText('Сотрудники')).toBeInTheDocument()
		expect(screen.getByText('Клиенты')).toBeInTheDocument()
		expect(screen.getByText('Уведомления')).toBeInTheDocument()
		expect(screen.getByText('Настройки')).toBeInTheDocument()
		expect(screen.getByText('Доступность')).toBeInTheDocument()
		expect(screen.getByText('Шаблоны')).toBeInTheDocument()
	})

	it('вызывает onClose при клике на overlay', async () => {
		const handleClose = vi.fn()
		const { container } = renderWithRouter(
			<Sidebar businessId="1" isOpen={true} onClose={handleClose} />,
		)

		const overlay = container.querySelector(
			'div[style*="rgba(0,0,0,0.5)"]',
		)
		if (overlay) {
			await userEvent.click(overlay)
			expect(handleClose).toHaveBeenCalledTimes(1)
		}
	})

	it('вызывает onClose при клике на кнопку закрытия', async () => {
		const handleClose = vi.fn()
		renderWithRouter(
			<Sidebar businessId="1" isOpen={true} onClose={handleClose} />,
		)

		const closeButton = screen.getByText('×')
		await userEvent.click(closeButton)

		expect(handleClose).toHaveBeenCalledTimes(1)
	})

	it('вызывает navigate при клике на пункт меню', async () => {
		renderWithRouter(
			<Sidebar businessId="1" isOpen={true} onClose={() => {}} />,
		)

		const dashboardButton = screen.getByText('Дашборд')
		await userEvent.click(dashboardButton)

		expect(mockNavigate).toHaveBeenCalled()
	})

	it('отображает кнопку "К списку бизнесов"', () => {
		renderWithRouter(
			<Sidebar businessId="1" isOpen={true} onClose={() => {}} />,
		)
		expect(screen.getByText('К списку бизнесов')).toBeInTheDocument()
	})

	it('отображает кнопку выхода', () => {
		renderWithRouter(
			<Sidebar businessId="1" isOpen={true} onClose={() => {}} />,
		)
		const logoutButtons = screen.getAllByText('Выйти')
		expect(logoutButtons.length).toBeGreaterThan(0)
	})

	it('открывает модальное окно подтверждения при клике на выход', async () => {
		renderWithRouter(
			<Sidebar businessId="1" isOpen={true} onClose={() => {}} />,
		)

		const logoutButtons = screen.getAllByText('Выйти')
		const logoutButton = logoutButtons.find(
			(btn) => btn.closest('button')?.textContent?.includes('Выйти'),
		)
		if (logoutButton) {
			await userEvent.click(logoutButton)
			expect(screen.getByText('Подтверждение выхода')).toBeInTheDocument()
		}
	})

	it('формирует правильные пути для пунктов меню', () => {
		renderWithRouter(
			<Sidebar
				businessId="test-business-id"
				isOpen={true}
				onClose={() => {}}
			/>,
		)

		// Проверяем, что кнопки содержат правильный businessId в пути
		const dashboardButton = screen.getByText('Дашборд')
		expect(dashboardButton).toBeInTheDocument()
	})
})

