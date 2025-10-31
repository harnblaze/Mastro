import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DateTimeDisplay } from '../DateTimeDisplay'
import { renderWithProviders } from '../../test/utils'

describe('DateTimeDisplay', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('отображает datetime по умолчанию', () => {
		const date = new Date('2024-01-15T10:00:00Z')
		renderWithProviders(<DateTimeDisplay dateTime={date} />)
		const display = screen.getByText(/янв/i)
		expect(display).toBeInTheDocument()
	})

	it('отображает date формат', () => {
		const date = new Date('2024-01-15T10:00:00Z')
		renderWithProviders(
			<DateTimeDisplay dateTime={date} format="date" />,
		)
		const display = screen.getByText(/января/i)
		expect(display).toBeInTheDocument()
	})

	it('отображает time формат', () => {
		const date = new Date('2024-01-15T10:30:00Z')
		renderWithProviders(
			<DateTimeDisplay dateTime={date} format="time" />,
		)
		const display = screen.getByText(/\d{2}:\d{2}/)
		expect(display).toBeInTheDocument()
	})

	it('отображает relative формат для недавнего времени', () => {
		const fiveMinutesAgo = new Date('2024-01-15T11:55:00Z')
		renderWithProviders(
			<DateTimeDisplay dateTime={fiveMinutesAgo} format="relative" />,
		)
		const display = screen.getByText(/мин назад/)
		expect(display).toBeInTheDocument()
	})

	it('отображает "только что" для очень недавнего времени', () => {
		const justNow = new Date('2024-01-15T11:59:30Z')
		renderWithProviders(
			<DateTimeDisplay dateTime={justNow} format="relative" />,
		)
		const display = screen.getByText('только что')
		expect(display).toBeInTheDocument()
	})

	it('принимает строку как dateTime', () => {
		renderWithProviders(
			<DateTimeDisplay dateTime="2024-01-15T10:00:00Z" format="date" />,
		)
		const display = screen.getByText(/января/i)
		expect(display).toBeInTheDocument()
	})

	it('использует кастомный timezone', () => {
		const date = new Date('2024-01-15T10:00:00Z')
		renderWithProviders(
			<DateTimeDisplay
				dateTime={date}
				format="datetime"
				timezone="Europe/Moscow"
			/>,
		)
		const display = screen.getByText(/янв/i)
		expect(display).toBeInTheDocument()
	})

	it('мемоизирует форматированную дату', () => {
		const date = new Date('2024-01-15T10:00:00Z')
		const { rerender } = renderWithProviders(
			<DateTimeDisplay dateTime={date} format="date" />,
		)
		const firstRender = screen.getByText(/января/i).textContent

		rerender(<DateTimeDisplay dateTime={date} format="date" />)
		const secondRender = screen.getByText(/января/i).textContent

		expect(firstRender).toBe(secondRender)
	})
})

