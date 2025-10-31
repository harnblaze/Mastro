import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { StatusBadge } from '../StatusBadge'
import { renderWithProviders } from '../../test/utils'

describe('StatusBadge', () => {
	it('отображает статус для booking с типом PENDING', () => {
		renderWithProviders(<StatusBadge status="PENDING" type="booking" />)
		expect(screen.getByText('Ожидает')).toBeInTheDocument()
	})

	it('отображает статус для booking с типом CONFIRMED', () => {
		renderWithProviders(<StatusBadge status="CONFIRMED" type="booking" />)
		expect(screen.getByText('Подтверждена')).toBeInTheDocument()
	})

	it('отображает статус для booking с типом COMPLETED', () => {
		renderWithProviders(<StatusBadge status="COMPLETED" type="booking" />)
		expect(screen.getByText('Завершена')).toBeInTheDocument()
	})

	it('отображает статус для booking с типом CANCELLED', () => {
		renderWithProviders(<StatusBadge status="CANCELLED" type="booking" />)
		expect(screen.getByText('Отменена')).toBeInTheDocument()
	})

	it('отображает статус для notification с типом SENT', () => {
		renderWithProviders(<StatusBadge status="SENT" type="notification" />)
		expect(screen.getByText('Отправлено')).toBeInTheDocument()
	})

	it('отображает статус для notification с типом FAILED', () => {
		renderWithProviders(<StatusBadge status="FAILED" type="notification" />)
		expect(screen.getByText('Ошибка')).toBeInTheDocument()
	})

	it('отображает статус для payment с типом PAID', () => {
		renderWithProviders(<StatusBadge status="PAID" type="payment" />)
		expect(screen.getByText('Оплачено')).toBeInTheDocument()
	})

	it('использует booking как тип по умолчанию', () => {
		renderWithProviders(<StatusBadge status="PENDING" />)
		expect(screen.getByText('Ожидает')).toBeInTheDocument()
	})

	it('мемоизирует конфигурацию статуса', () => {
		const { rerender } = renderWithProviders(
			<StatusBadge status="PENDING" type="booking" />,
		)
		expect(screen.getByText('Ожидает')).toBeInTheDocument()

		rerender(<StatusBadge status="CONFIRMED" type="booking" />)
		expect(screen.getByText('Подтверждена')).toBeInTheDocument()
	})
})

