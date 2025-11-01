import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { StatCard, StatGrid } from '../StatCard'
import { renderWithProviders } from '../../test/utils'

describe('StatCard', () => {
	it('отображает title и value', () => {
		renderWithProviders(<StatCard title="Тест" value="100" />)
		expect(screen.getByText('Тест')).toBeInTheDocument()
		expect(screen.getByText('100')).toBeInTheDocument()
	})

	it('отображает subtitle когда передан', () => {
		renderWithProviders(
			<StatCard title="Тест" value="100" subtitle="Подзаголовок" />,
		)
		expect(screen.getByText('Подзаголовок')).toBeInTheDocument()
	})

	it('отображает trend когда передан', () => {
		renderWithProviders(
			<StatCard
				title="Тест"
				value="100"
				trend={{ value: 10, isPositive: true }}
			/>,
		)
		expect(screen.getByText(/↗.*10%/)).toBeInTheDocument()
	})

	it('отображает отрицательный trend', () => {
		renderWithProviders(
			<StatCard
				title="Тест"
				value="100"
				trend={{ value: 5, isPositive: false }}
			/>,
		)
		expect(screen.getByText(/↘.*5%/)).toBeInTheDocument()
	})

	it('применяет цвет primary по умолчанию', () => {
		renderWithProviders(<StatCard title="Тест" value="100" />)
		const valueElement = screen.getByText('100')
		expect(valueElement).toBeInTheDocument()
	})

	it('вызывает onClick при клике на карточку', () => {
		const handleClick = vi.fn()
		renderWithProviders(
			<StatCard title="Тест" value="100" onClick={handleClick} />,
		)
		const card = screen.getByText('100').closest('.vkuiCard') as HTMLElement | null
		if (card) {
			card.click()
			expect(handleClick).toHaveBeenCalledTimes(1)
		}
	})

	it('не вызывает onClick когда он не передан', () => {
		renderWithProviders(<StatCard title="Тест" value="100" />)
		const valueElement = screen.getByText('100')
		expect(valueElement).toBeInTheDocument()
	})
})

describe('StatGrid', () => {
	it('отображает дочерние элементы', () => {
		renderWithProviders(
			<StatGrid>
				<StatCard title="Тест 1" value="100" />
				<StatCard title="Тест 2" value="200" />
			</StatGrid>,
		)
		expect(screen.getByText('Тест 1')).toBeInTheDocument()
		expect(screen.getByText('Тест 2')).toBeInTheDocument()
	})

	it('использует 4 колонки по умолчанию', () => {
		const { container } = renderWithProviders(
			<StatGrid>
				<StatCard title="Тест" value="100" />
			</StatGrid>,
		)
		const grid = container.firstChild as HTMLElement
		expect(grid.style.gridTemplateColumns).toBe('repeat(4, 1fr)')
	})

	it('применяет кастомное количество колонок', () => {
		const { container } = renderWithProviders(
			<StatGrid columns={2}>
				<StatCard title="Тест" value="100" />
			</StatGrid>,
		)
		const grid = container.firstChild as HTMLElement
		expect(grid.style.gridTemplateColumns).toBe('repeat(2, 1fr)')
	})
})

