import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMobile } from '../useMobile'

describe('useMobile', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('возвращает isMobile=true для ширины меньше 640px', () => {
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 500,
		})

		const { result } = renderHook(() => useMobile())
		expect(result.current.isMobile).toBe(true)
		expect(result.current.isTablet).toBe(false)
		expect(result.current.isDesktop).toBe(false)
		expect(result.current.width).toBe(500)
	})

	it('возвращает isTablet=true для ширины между 640px и 1024px', () => {
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 800,
		})

		const { result } = renderHook(() => useMobile())
		expect(result.current.isMobile).toBe(false)
		expect(result.current.isTablet).toBe(true)
		expect(result.current.isDesktop).toBe(false)
		expect(result.current.width).toBe(800)
	})

	it('возвращает isDesktop=true для ширины больше или равной 1024px', () => {
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 1200,
		})

		const { result } = renderHook(() => useMobile())
		expect(result.current.isMobile).toBe(false)
		expect(result.current.isTablet).toBe(false)
		expect(result.current.isDesktop).toBe(true)
		expect(result.current.width).toBe(1200)
	})

	it('обновляет размеры при изменении окна', () => {
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 500,
		})

		const { result } = renderHook(() => useMobile())
		expect(result.current.width).toBe(500)
		expect(result.current.isMobile).toBe(true)

		act(() => {
			Object.defineProperty(window, 'innerWidth', {
				writable: true,
				configurable: true,
				value: 1200,
			})
			window.dispatchEvent(new Event('resize'))
		})

		expect(result.current.width).toBe(1200)
		expect(result.current.isDesktop).toBe(true)
	})

	it('правильно очищает обработчик событий при размонтировании', () => {
		const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
		const { unmount } = renderHook(() => useMobile())

		unmount()

		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			'resize',
			expect.any(Function),
		)
	})

})

