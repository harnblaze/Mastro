import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardGrid, EmptyCard } from '../Card'
import { renderWithProviders } from '../../test/utils'

describe('Card', () => {
	it('отображает children', () => {
		renderWithProviders(
			<Card>
				<div>Контент карточки</div>
			</Card>,
		)
		expect(screen.getByText('Контент карточки')).toBeInTheDocument()
	})

	it('отображает title когда передан', () => {
		renderWithProviders(<Card title="Заголовок">Контент</Card>)
		expect(screen.getByText('Заголовок')).toBeInTheDocument()
	})

	it('отображает subtitle когда передан', () => {
		renderWithProviders(
			<Card title="Заголовок" subtitle="Подзаголовок">
				Контент
			</Card>,
		)
		expect(screen.getByText('Подзаголовок')).toBeInTheDocument()
	})

	it('вызывает onClick при клике на карточку', () => {
		const handleClick = vi.fn()
		renderWithProviders(
			<Card onClick={handleClick}>Контент</Card>,
		)
		const card = screen.getByText('Контент').closest('.vkuiCard')
		if (card) {
			card.click()
			expect(handleClick).toHaveBeenCalledTimes(1)
		}
	})

	it('применяет кастомный className', () => {
		const { container } = renderWithProviders(
			<Card className="custom-class">Контент</Card>,
		)
		const card = container.querySelector('.custom-class')
		expect(card).toBeInTheDocument()
	})
})

describe('CardGrid', () => {
	it('отображает дочерние элементы', () => {
		renderWithProviders(
			<CardGrid>
				<Card>Карточка 1</Card>
				<Card>Карточка 2</Card>
			</CardGrid>,
		)
		expect(screen.getByText('Карточка 1')).toBeInTheDocument()
		expect(screen.getByText('Карточка 2')).toBeInTheDocument()
	})

	it('использует gap lg по умолчанию', () => {
		const { container } = renderWithProviders(
			<CardGrid>
				<Card>Тест</Card>
			</CardGrid>,
		)
		const grid = container.firstChild as HTMLElement
		expect(grid.style.gap).toBe('16px')
	})

	it('применяет кастомный gap', () => {
		const { container } = renderWithProviders(
			<CardGrid gap="sm">
				<Card>Тест</Card>
			</CardGrid>,
		)
		const grid = container.firstChild as HTMLElement
		expect(grid.style.gap).toBe('8px')
	})
})

describe('EmptyCard', () => {
	it('отображает title', () => {
		renderWithProviders(<EmptyCard title="Пусто" />)
		expect(screen.getByText('Пусто')).toBeInTheDocument()
	})

	it('отображает subtitle когда передан', () => {
		renderWithProviders(
			<EmptyCard title="Пусто" subtitle="Нет данных" />,
		)
		expect(screen.getByText('Нет данных')).toBeInTheDocument()
	})

	it('отображает action когда передан', () => {
		renderWithProviders(
			<EmptyCard
				title="Пусто"
				action={<button>Действие</button>}
			/>,
		)
		expect(screen.getByText('Действие')).toBeInTheDocument()
	})
})

