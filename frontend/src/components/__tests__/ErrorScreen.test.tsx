import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorScreen } from '../ErrorScreen'
import { renderWithProviders } from '../../test/utils'

describe('ErrorScreen', () => {
	it('отображает заголовок по умолчанию', () => {
		renderWithProviders(
			<ErrorScreen message="Ошибка" onRetry={() => {}} />,
		)
		expect(screen.getByText('Ошибка загрузки')).toBeInTheDocument()
	})

	it('отображает кастомный заголовок', () => {
		renderWithProviders(
			<ErrorScreen
				title="Кастомная ошибка"
				message="Описание"
				onRetry={() => {}}
			/>,
		)
		expect(screen.getByText('Кастомная ошибка')).toBeInTheDocument()
	})

	it('отображает сообщение об ошибке', () => {
		renderWithProviders(
			<ErrorScreen message="Произошла ошибка" onRetry={() => {}} />,
		)
		expect(screen.getByText('Произошла ошибка')).toBeInTheDocument()
	})

	it('отображает кнопку повтора по умолчанию', () => {
		renderWithProviders(
			<ErrorScreen message="Ошибка" onRetry={() => {}} />,
		)
		expect(screen.getByText('Повторить')).toBeInTheDocument()
	})

	it('отображает кастомный текст кнопки', () => {
		renderWithProviders(
			<ErrorScreen
				message="Ошибка"
				onRetry={() => {}}
				retryButtonText="Попробовать снова"
			/>,
		)
		expect(screen.getByText('Попробовать снова')).toBeInTheDocument()
	})

	it('вызывает onRetry при клике на кнопку', async () => {
		const handleRetry = vi.fn()
		renderWithProviders(
			<ErrorScreen message="Ошибка" onRetry={handleRetry} />,
		)

		const button = screen.getByText('Повторить')
		await userEvent.click(button)

		expect(handleRetry).toHaveBeenCalledTimes(1)
	})

	it('отображает иконку предупреждения', () => {
		renderWithProviders(
			<ErrorScreen message="Ошибка" onRetry={() => {}} />,
		)
		expect(screen.getByText('⚠️')).toBeInTheDocument()
	})
})

