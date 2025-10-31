import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary, NotFoundPage } from '../ErrorBoundary'
import { renderWithProviders } from '../../test/utils'

// Компонент, который выбрасывает ошибку для тестирования ErrorBoundary
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
	if (shouldThrow) {
		throw new Error('Test error')
	}
	return <div>Успешно</div>
}

describe('ErrorBoundary', () => {
	beforeEach(() => {
		// Подавляем вывод ошибок в консоль во время тестов
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('отображает children когда ошибок нет', () => {
		renderWithProviders(
			<ErrorBoundary>
				<div>Контент</div>
			</ErrorBoundary>,
		)
		expect(screen.getByText('Контент')).toBeInTheDocument()
	})

	it('отображает fallback UI при ошибке', () => {
		renderWithProviders(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
		)
		expect(screen.getByText('Что-то пошло не так 😔')).toBeInTheDocument()
	})

	it('отображает кастомный fallback когда передан', () => {
		renderWithProviders(
			<ErrorBoundary fallback={<div>Кастомная ошибка</div>}>
				<ThrowError />
			</ErrorBoundary>,
		)
		expect(screen.getByText('Кастомная ошибка')).toBeInTheDocument()
	})

	it('отображает кнопку обновления страницы', () => {
		renderWithProviders(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
		)

		const reloadButton = screen.getByText('Обновить страницу')
		expect(reloadButton).toBeInTheDocument()
	})

	it('вызывает window.location.reload при клике на кнопку', async () => {
		const reloadSpy = vi.fn()
		Object.defineProperty(window, 'location', {
			value: {
				reload: reloadSpy,
			},
			writable: true,
		})

		renderWithProviders(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
		)

		const reloadButton = screen.getByText('Обновить страницу')
		await userEvent.click(reloadButton)

		expect(reloadSpy).toHaveBeenCalledTimes(1)
	})

	it('логирует ошибку в консоль', () => {
		const consoleErrorSpy = vi.spyOn(console, 'error')

		renderWithProviders(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
		)

		expect(consoleErrorSpy).toHaveBeenCalled()
	})
})

describe('NotFoundPage', () => {
	it('отображает заголовок', () => {
		renderWithProviders(<NotFoundPage />)
		// Проверяем, что заголовок присутствует (может быть в нескольких местах)
		const headings = screen.getAllByText('Страница не найдена')
		expect(headings.length).toBeGreaterThan(0)
	})

	it('отображает иконку', () => {
		renderWithProviders(<NotFoundPage />)
		expect(screen.getByText('🔍')).toBeInTheDocument()
	})

	it('отображает сообщение', () => {
		renderWithProviders(<NotFoundPage />)
		expect(
			screen.getByText(
				'Запрашиваемая страница не существует или была перемещена.',
			),
		).toBeInTheDocument()
	})

	it('отображает кнопку возврата', () => {
		renderWithProviders(<NotFoundPage />)
		expect(screen.getByText('Вернуться назад')).toBeInTheDocument()
	})

	it('вызывает window.history.back при клике на кнопку', async () => {
		const backSpy = vi.fn()
		Object.defineProperty(window, 'history', {
			value: {
				back: backSpy,
			},
			writable: true,
		})

		renderWithProviders(<NotFoundPage />)

		const backButton = screen.getByText('Вернуться назад')
		await userEvent.click(backButton)

		expect(backSpy).toHaveBeenCalledTimes(1)
	})
})

