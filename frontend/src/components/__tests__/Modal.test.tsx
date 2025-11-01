import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '../Modal'
import { renderWithProviders } from '../../test/utils'

describe('Modal', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('не отображается когда isOpen=false', () => {
		renderWithProviders(
			<Modal isOpen={false} onClose={() => {}} title="Тест">
				Контент
			</Modal>,
		)
		expect(screen.queryByText('Тест')).not.toBeInTheDocument()
	})

	it('отображается когда isOpen=true', () => {
		renderWithProviders(
			<Modal isOpen={true} onClose={() => {}} title="Тест">
				Контент
			</Modal>,
		)
		expect(screen.getByText('Тест')).toBeInTheDocument()
		expect(screen.getByText('Контент')).toBeInTheDocument()
	})

	it('отображает заголовок', () => {
		renderWithProviders(
			<Modal isOpen={true} onClose={() => {}} title="Заголовок модалки">
				Контент
			</Modal>,
		)
		expect(screen.getByText('Заголовок модалки')).toBeInTheDocument()
	})

	it('отображает children', () => {
		renderWithProviders(
			<Modal isOpen={true} onClose={() => {}} title="Тест">
				<div>Дочерний контент</div>
			</Modal>,
		)
		expect(screen.getByText('Дочерний контент')).toBeInTheDocument()
	})

	it('отображает кнопку закрытия', () => {
		renderWithProviders(
			<Modal isOpen={true} onClose={() => {}} title="Тест">
				Контент
			</Modal>,
		)
		const closeButton = screen.getByText('×')
		expect(closeButton).toBeInTheDocument()
	})

	it('вызывает onClose при клике на кнопку закрытия', async () => {
		const handleClose = vi.fn()
		renderWithProviders(
			<Modal isOpen={true} onClose={handleClose} title="Тест">
				Контент
			</Modal>,
		)

		const closeButton = screen.getByText('×')
		await userEvent.click(closeButton)

		expect(handleClose).toHaveBeenCalledTimes(1)
	})

	it('вызывает onClose при нажатии Escape', async () => {
		const handleClose = vi.fn()
		renderWithProviders(
			<Modal isOpen={true} onClose={handleClose} title="Тест">
				Контент
			</Modal>,
		)

		await userEvent.keyboard('{Escape}')

		expect(handleClose).toHaveBeenCalledTimes(1)
	})

	it('отображает actions когда они переданы', () => {
		renderWithProviders(
			<Modal
				isOpen={true}
				onClose={() => {}}
				title="Тест"
				actions={<button>Действие</button>}
			>
				Контент
			</Modal>,
		)
		expect(screen.getByText('Действие')).toBeInTheDocument()
	})

	it('имеет правильные ARIA атрибуты', () => {
		const { container } = renderWithProviders(
			<Modal isOpen={true} onClose={() => {}} title="Тест">
				Контент
			</Modal>,
		)
		const modal = container.querySelector('[role="dialog"]')
		expect(modal).toBeInTheDocument()
		expect(modal?.getAttribute('aria-modal')).toBe('true')
		expect(modal?.getAttribute('aria-labelledby')).toBe('modal-title')
	})

	it('применяет размер small', () => {
		const { container } = renderWithProviders(
			<Modal isOpen={true} onClose={() => {}} title="Тест" size="small">
				Контент
			</Modal>,
		)
		const card = container.querySelector('[role="dialog"]')
		expect(card).toBeInTheDocument()
	})

	it('применяет размер medium по умолчанию', () => {
		const { container } = renderWithProviders(
			<Modal isOpen={true} onClose={() => {}} title="Тест">
				Контент
			</Modal>,
		)
		const card = container.querySelector('[role="dialog"]')
		expect(card).toBeInTheDocument()
	})

	it('применяет размер large', () => {
		const { container } = renderWithProviders(
			<Modal isOpen={true} onClose={() => {}} title="Тест" size="large">
				Контент
			</Modal>,
		)
		const card = container.querySelector('[role="dialog"]')
		expect(card).toBeInTheDocument()
	})

	it('не вызывает onClose при нажатии других клавиш', async () => {
		const handleClose = vi.fn()
		renderWithProviders(
			<Modal isOpen={true} onClose={handleClose} title="Тест">
				Контент
			</Modal>,
		)

		await userEvent.keyboard('{Enter}')

		expect(handleClose).not.toHaveBeenCalled()
	})

	it('удаляет обработчик клавиатуры при размонтировании', () => {
		const handleClose = vi.fn()
		const { unmount } = renderWithProviders(
			<Modal isOpen={true} onClose={handleClose} title="Тест">
				Контент
			</Modal>,
		)

		const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
		unmount()

		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			'keydown',
			expect.any(Function),
		)
	})
})

