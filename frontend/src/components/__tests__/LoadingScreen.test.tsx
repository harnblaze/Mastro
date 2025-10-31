import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { LoadingScreen } from '../LoadingScreen'
import { renderWithProviders } from '../../test/utils'

describe('LoadingScreen', () => {
	it('отображает спиннер загрузки', () => {
		renderWithProviders(<LoadingScreen />)
		const spinner = screen.getByRole('status')
		expect(spinner).toBeInTheDocument()
	})

	it('имеет правильные стили контейнера', () => {
		const { container } = renderWithProviders(<LoadingScreen />)
		const div = container.querySelector('div')
		expect(div).toBeInTheDocument()
		expect(div?.style.display).toBe('flex')
		expect(div?.style.justifyContent).toBe('center')
		expect(div?.style.alignItems).toBe('center')
	})
})

