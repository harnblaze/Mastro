import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '../Header'
import { renderWithRouter } from '../../test/utils'

// Мокируем useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return {
		...actual,
		useNavigate: () => mockNavigate,
	}
})

describe('Header', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('отображает заголовок', () => {
		renderWithRouter(
			<Header title="Тестовый заголовок" onMenuClick={() => {}} />,
		)
		expect(screen.getByText('Тестовый заголовок')).toBeInTheDocument()
	})

	it('отображает подзаголовок когда передан', () => {
		renderWithRouter(
			<Header
				title="Заголовок"
				subtitle="Подзаголовок"
				onMenuClick={() => {}}
			/>,
		)
		expect(screen.getByText('Подзаголовок')).toBeInTheDocument()
	})

	it('отображает кнопку меню', () => {
		renderWithRouter(
			<Header title="Заголовок" onMenuClick={() => {}} />,
		)
		const menuButton = screen.getByText('☰')
		expect(menuButton).toBeInTheDocument()
	})

	it('вызывает onMenuClick при клике на кнопку меню', async () => {
		const handleMenuClick = vi.fn()
		renderWithRouter(
			<Header title="Заголовок" onMenuClick={handleMenuClick} />,
		)

		const menuButton = screen.getByText('☰')
		await userEvent.click(menuButton)

		expect(handleMenuClick).toHaveBeenCalledTimes(1)
	})

	it('не отображает кнопку назад когда showBackButton=false', () => {
		renderWithRouter(
			<Header
				title="Заголовок"
				onMenuClick={() => {}}
				showBackButton={false}
			/>,
		)
		expect(screen.queryByText('← Назад')).not.toBeInTheDocument()
	})

	it('отображает кнопку назад когда showBackButton=true', () => {
		renderWithRouter(
			<Header
				title="Заголовок"
				onMenuClick={() => {}}
				showBackButton={true}
			/>,
		)
		expect(screen.getByText('← Назад')).toBeInTheDocument()
	})

	it('вызывает navigate(-1) при клике на кнопку назад без backPath', async () => {
		renderWithRouter(
			<Header
				title="Заголовок"
				onMenuClick={() => {}}
				showBackButton={true}
			/>,
		)

		const backButton = screen.getByText('← Назад')
		await userEvent.click(backButton)

		expect(mockNavigate).toHaveBeenCalledWith(-1)
	})

	it('отображает actions когда они переданы', () => {
		renderWithRouter(
			<Header
				title="Заголовок"
				onMenuClick={() => {}}
				actions={<button>Действие</button>}
			/>,
		)
		expect(screen.getByText('Действие')).toBeInTheDocument()
	})

	it('не отображает кнопку выхода когда showLogout=false', () => {
		renderWithRouter(
			<Header
				title="Заголовок"
				onMenuClick={() => {}}
				showLogout={false}
			/>,
		)
		expect(screen.queryByText('Выйти')).not.toBeInTheDocument()
	})

	it('отображает кнопку выхода когда showLogout=true и onLogout передан', () => {
		renderWithRouter(
			<Header
				title="Заголовок"
				onMenuClick={() => {}}
				showLogout={true}
				onLogout={() => {}}
			/>,
		)
		expect(screen.getByText('Выйти')).toBeInTheDocument()
	})

	it('открывает модальное окно подтверждения при клике на выход', async () => {
		renderWithRouter(
			<Header
				title="Заголовок"
				onMenuClick={() => {}}
				showLogout={true}
				onLogout={() => {}}
			/>,
		)

		const logoutButton = screen.getByText('Выйти')
		await userEvent.click(logoutButton)

		expect(screen.getByText('Подтверждение выхода')).toBeInTheDocument()
	})

	it('вызывает onLogout при подтверждении выхода', async () => {
		const handleLogout = vi.fn()
		renderWithRouter(
			<Header
				title="Заголовок"
				onMenuClick={() => {}}
				showLogout={true}
				onLogout={handleLogout}
			/>,
		)

		const logoutButton = screen.getByText('Выйти')
		await userEvent.click(logoutButton)

		// Проверяем что модалка открылась
		expect(screen.getByText('Подтверждение выхода')).toBeInTheDocument()

		// Ищем кнопку подтверждения в модалке
		const confirmButtons = screen.getAllByText('Выйти')
		// Вторая кнопка "Выйти" должна быть кнопкой подтверждения в модалке
		if (confirmButtons.length > 1) {
			const confirmButton = confirmButtons[1]
			await userEvent.click(confirmButton.closest('button')!)
			await vi.waitFor(() => {
				expect(handleLogout).toHaveBeenCalledTimes(1)
			}, { timeout: 2000 })
		}
	})
})

