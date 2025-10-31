import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotFoundScreen } from '../NotFoundScreen'
import { renderWithProviders } from '../../test/utils'

describe('NotFoundScreen', () => {
	it('отображает иконку по умолчанию', () => {
		renderWithProviders(<NotFoundScreen onAction={() => {}} />)
		expect(screen.getByText('❌')).toBeInTheDocument()
	})

	it('отображает кастомную иконку', () => {
		renderWithProviders(
			<NotFoundScreen icon="🔍" onAction={() => {}} />,
		)
		expect(screen.getByText('🔍')).toBeInTheDocument()
	})

	it('отображает заголовок по умолчанию', () => {
		renderWithProviders(<NotFoundScreen onAction={() => {}} />)
		expect(screen.getByText('Данные не найдены')).toBeInTheDocument()
	})

	it('отображает кастомный заголовок', () => {
		renderWithProviders(
			<NotFoundScreen title="Ничего не найдено" onAction={() => {}} />,
		)
		expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
	})

	it('отображает сообщение по умолчанию', () => {
		renderWithProviders(<NotFoundScreen onAction={() => {}} />)
		expect(
			screen.getByText(
				'Возможно, данные были удалены или произошла ошибка',
			),
		).toBeInTheDocument()
	})

	it('отображает кастомное сообщение', () => {
		renderWithProviders(
			<NotFoundScreen
				message="Данные отсутствуют"
				onAction={() => {}}
			/>,
		)
		expect(screen.getByText('Данные отсутствуют')).toBeInTheDocument()
	})

	it('отображает кнопку с текстом по умолчанию', () => {
		renderWithProviders(<NotFoundScreen onAction={() => {}} />)
		expect(screen.getByText('Назад')).toBeInTheDocument()
	})

	it('отображает кастомный текст кнопки', () => {
		renderWithProviders(
			<NotFoundScreen
				onAction={() => {}}
				buttonText="Вернуться"
			/>,
		)
		expect(screen.getByText('Вернуться')).toBeInTheDocument()
	})

	it('вызывает onAction при клике на кнопку', async () => {
		const handleAction = vi.fn()
		renderWithProviders(<NotFoundScreen onAction={handleAction} />)

		const button = screen.getByText('Назад')
		await userEvent.click(button)

		expect(handleAction).toHaveBeenCalledTimes(1)
	})
})

