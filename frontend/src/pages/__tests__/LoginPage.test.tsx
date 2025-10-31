import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '../LoginPage'
import { renderWithRouter } from '../../test/utils'

// Мокируем useAuth
const mockLogin = vi.fn()
const mockRegister = vi.fn()
const mockVkAuth = vi.fn()

vi.mock('../../contexts/AuthContext', () => ({
	useAuth: () => ({
		login: mockLogin,
		register: mockRegister,
		vkAuth: mockVkAuth,
		isAuthenticated: false,
		user: null,
	}),
}))

// Мокируем useVkBridge
const mockGetAuthToken = vi.fn()

vi.mock('../../hooks/useVkBridge', () => ({
	useVkBridge: () => ({
		isReady: true,
		getAuthToken: mockGetAuthToken,
	}),
}))

// Мокируем useSearchParams
const mockSetSearchParams = vi.fn()
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return {
		...actual,
		useSearchParams: () => [
			new URLSearchParams(),
			mockSetSearchParams,
		],
		useNavigate: () => vi.fn(),
	}
})

// Мокируем window.location
const mockReplace = vi.fn()
Object.defineProperty(window, 'location', {
	value: {
		replace: mockReplace,
		href: '',
	},
	writable: true,
})

describe('LoginPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('отображает заголовок и подзаголовок', () => {
		renderWithRouter(<LoginPage />)
		expect(screen.getByText('Добро пожаловать в Mastro')).toBeInTheDocument()
		expect(
			screen.getByText('Сервис бронирования для самозанятых и салонов'),
		).toBeInTheDocument()
	})

	it('отображает табы для входа и регистрации', () => {
		renderWithRouter(<LoginPage />)
		expect(screen.getByText('Вход')).toBeInTheDocument()
		expect(screen.getByText('Регистрация')).toBeInTheDocument()
	})

	it('отображает форму с полями email и password', () => {
		renderWithRouter(<LoginPage />)
		expect(screen.getByPlaceholderText('Введите email')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('Введите пароль')).toBeInTheDocument()
	})

	it('отображает кнопку входа когда активен таб login', () => {
		renderWithRouter(<LoginPage />)
		expect(screen.getByText('Войти')).toBeInTheDocument()
	})

	it('отображает кнопку регистрации когда активен таб register', async () => {
		renderWithRouter(<LoginPage />)

		const registerTab = screen.getByText('Регистрация')
		await userEvent.click(registerTab)

		await waitFor(() => {
			expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument()
		})
	})

	it('кнопка отправки заблокирована когда поля пустые', () => {
		renderWithRouter(<LoginPage />)
		const submitButton = screen.getByText('Войти')
		expect(submitButton.closest('button')).toBeDisabled()
	})

	it('кнопка отправки активна когда поля заполнены', async () => {
		renderWithRouter(<LoginPage />)

		const emailInput = screen.getByPlaceholderText('Введите email')
		const passwordInput = screen.getByPlaceholderText('Введите пароль')

		await userEvent.type(emailInput, 'test@test.com')
		await userEvent.type(passwordInput, 'password123')

		const submitButton = screen.getByText('Войти')
		expect(submitButton.closest('button')).not.toBeDisabled()
	})

	it('вызывает login при отправке формы в табе login', async () => {
		mockLogin.mockResolvedValue(undefined)
		renderWithRouter(<LoginPage />)

		const emailInput = screen.getByPlaceholderText('Введите email')
		const passwordInput = screen.getByPlaceholderText('Введите пароль')

		await userEvent.type(emailInput, 'test@test.com')
		await userEvent.type(passwordInput, 'password123')

		const submitButton = screen.getByText('Войти')
		await userEvent.click(submitButton)

		await waitFor(() => {
			expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123')
		})
	})

	it('вызывает register при отправке формы в табе register', async () => {
		mockRegister.mockResolvedValue(undefined)
		renderWithRouter(<LoginPage />)

		const registerTab = screen.getByText('Регистрация')
		await userEvent.click(registerTab)

		const emailInput = screen.getByPlaceholderText('Введите email')
		const passwordInput = screen.getByPlaceholderText('Введите пароль')

		await userEvent.type(emailInput, 'test@test.com')
		await userEvent.type(passwordInput, 'password123')

		await waitFor(() => {
			const submitButton = screen.getByText('Зарегистрироваться')
			return submitButton
		})

		const submitButton = screen.getByText('Зарегистрироваться')
		await userEvent.click(submitButton)

		await waitFor(() => {
			expect(mockRegister).toHaveBeenCalledWith('test@test.com', 'password123')
		})
	})

	it('отображает ошибку при ошибке авторизации', async () => {
		mockLogin.mockRejectedValue({
			response: { data: { message: 'Неверный email или пароль' } },
		})
		renderWithRouter(<LoginPage />)

		const emailInput = screen.getByPlaceholderText('Введите email')
		const passwordInput = screen.getByPlaceholderText('Введите пароль')

		await userEvent.type(emailInput, 'test@test.com')
		await userEvent.type(passwordInput, 'password123')

		const submitButton = screen.getByText('Войти')
		await userEvent.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument()
		})
	})

	it('отображает кнопку VK авторизации', () => {
		renderWithRouter(<LoginPage />)
		expect(screen.getByText('Войти через VK')).toBeInTheDocument()
	})

	it('вызывает vkAuth при клике на кнопку VK', async () => {
		mockGetAuthToken.mockResolvedValue('vk-token-123')
		mockVkAuth.mockResolvedValue(undefined)
		renderWithRouter(<LoginPage />)

		const vkButton = screen.getByText('Войти через VK')
		await userEvent.click(vkButton)

		await waitFor(() => {
			expect(mockGetAuthToken).toHaveBeenCalled()
		})

		await waitFor(() => {
			expect(mockVkAuth).toHaveBeenCalledWith('vk-token-123')
		})
	})

	it('отображает ошибку при ошибке VK авторизации', async () => {
		mockGetAuthToken.mockRejectedValue(new Error('VK Bridge не готов'))
		renderWithRouter(<LoginPage />)

		const vkButton = screen.getByText('Войти через VK')
		await userEvent.click(vkButton)

		await waitFor(() => {
			expect(screen.getByText(/VK Bridge не готов/)).toBeInTheDocument()
		})
	})

	it('очищает ошибку при смене таба', async () => {
		mockLogin.mockRejectedValue({
			response: { data: { message: 'Ошибка' } },
		})
		renderWithRouter(<LoginPage />)

		const emailInput = screen.getByPlaceholderText('Введите email')
		const passwordInput = screen.getByPlaceholderText('Введите пароль')

		await userEvent.type(emailInput, 'test@test.com')
		await userEvent.type(passwordInput, 'password123')

		const submitButton = screen.getByText('Войти')
		await userEvent.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText('Ошибка')).toBeInTheDocument()
		})

		const registerTab = screen.getByText('Регистрация')
		await userEvent.click(registerTab)

		await waitFor(() => {
			expect(screen.queryByText('Ошибка')).not.toBeInTheDocument()
		})
	})
})

