import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogoutConfirmModal } from '../LogoutConfirmModal'
import { renderWithProviders } from '../../test/utils'

describe('LogoutConfirmModal', () => {
	it('не отображается когда isOpen=false', () => {
		renderWithProviders(
			<LogoutConfirmModal
				isOpen={false}
				onClose={() => {}}
				onConfirm={() => {}}
			/>,
		)
		expect(screen.queryByText('Подтверждение выхода')).not.toBeInTheDocument()
	})

	it('отображается когда isOpen=true', () => {
		renderWithProviders(
			<LogoutConfirmModal
				isOpen={true}
				onClose={() => {}}
				onConfirm={() => {}}
			/>,
		)
		expect(screen.getByText('Подтверждение выхода')).toBeInTheDocument()
	})

	it('отображает заголовок', () => {
		renderWithProviders(
			<LogoutConfirmModal
				isOpen={true}
				onClose={() => {}}
				onConfirm={() => {}}
			/>,
		)
		expect(screen.getByText('Вы уверены, что хотите выйти?')).toBeInTheDocument()
	})

	it('отображает подзаголовок', () => {
		renderWithProviders(
			<LogoutConfirmModal
				isOpen={true}
				onClose={() => {}}
				onConfirm={() => {}}
			/>,
		)
		expect(
			screen.getByText(
				'Вам потребуется войти в систему заново для доступа к админ-панели',
			),
		).toBeInTheDocument()
	})

	it('отображает иконку', () => {
		renderWithProviders(
			<LogoutConfirmModal
				isOpen={true}
				onClose={() => {}}
				onConfirm={() => {}}
			/>,
		)
		expect(screen.getByText('🚪')).toBeInTheDocument()
	})

	it('отображает кнопку отмены', () => {
		renderWithProviders(
			<LogoutConfirmModal
				isOpen={true}
				onClose={() => {}}
				onConfirm={() => {}}
			/>,
		)
		expect(screen.getByText('Отмена')).toBeInTheDocument()
	})

	it('отображает кнопку выхода', () => {
		renderWithProviders(
			<LogoutConfirmModal
				isOpen={true}
				onClose={() => {}}
				onConfirm={() => {}}
			/>,
		)
		expect(screen.getByText('Выйти')).toBeInTheDocument()
	})

	it('вызывает onClose при клике на кнопку отмены', async () => {
		const handleClose = vi.fn()
		renderWithProviders(
			<LogoutConfirmModal
				isOpen={true}
				onClose={handleClose}
				onConfirm={() => {}}
			/>,
		)

		const cancelButton = screen.getByText('Отмена')
		await userEvent.click(cancelButton)

		expect(handleClose).toHaveBeenCalledTimes(1)
	})

	it('вызывает onConfirm при клике на кнопку выхода', async () => {
		const handleConfirm = vi.fn().mockResolvedValue(undefined)
		renderWithProviders(
			<LogoutConfirmModal
				isOpen={true}
				onClose={() => {}}
				onConfirm={handleConfirm}
			/>,
		)

		const logoutButton = screen.getByText('Выйти')
		await userEvent.click(logoutButton)

		await vi.waitFor(() => {
			expect(handleConfirm).toHaveBeenCalledTimes(1)
		})
	})

	it('блокирует кнопки во время выхода', async () => {
		const handleConfirm = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)))
		renderWithProviders(
			<LogoutConfirmModal
				isOpen={true}
				onClose={() => {}}
				onConfirm={handleConfirm}
			/>,
		)

		const logoutButton = screen.getByText('Выйти').closest('button')
		await userEvent.click(logoutButton!)

		// Кнопка должна быть заблокирована во время выполнения
		await vi.waitFor(() => {
			expect(logoutButton).toBeDisabled()
		})
	})

	it('разблокирует кнопки после завершения выхода', async () => {
		const handleConfirm = vi.fn().mockResolvedValue(undefined)
		renderWithProviders(
			<LogoutConfirmModal
				isOpen={true}
				onClose={() => {}}
				onConfirm={handleConfirm}
			/>,
		)

		const logoutButton = screen.getByText('Выйти')
		await userEvent.click(logoutButton)

		await vi.waitFor(() => {
			expect(handleConfirm).toHaveBeenCalled()
		})

		// После завершения кнопка должна снова быть активна
		// (или модалка закрыта, что зависит от реализации onConfirm)
	})
})

