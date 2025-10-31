import { describe, it, expect } from 'vitest'
import {
	createAdminRoutePath,
	createClientRoutePath,
	type AdminRoutePath,
	type ClientRoutePath,
	type RoutePath,
} from '../routes'

describe('routes utilities', () => {
	describe('createAdminRoutePath', () => {
		it('создает путь для админского роута', () => {
			const path = createAdminRoutePath('business-123', 'dashboard')
			expect(path).toBe('/businesses/business-123/dashboard')
		})

		it('создает путь для админского роута с разными маршрутами', () => {
			expect(createAdminRoutePath('business-123', 'calendar')).toBe(
				'/businesses/business-123/calendar',
			)
			expect(createAdminRoutePath('business-123', 'bookings')).toBe(
				'/businesses/business-123/bookings',
			)
			expect(createAdminRoutePath('business-123', 'services')).toBe(
				'/businesses/business-123/services',
			)
		})

		it('корректно обрабатывает специальные символы в businessId', () => {
			const path = createAdminRoutePath('business-123-abc', 'dashboard')
			expect(path).toBe('/businesses/business-123-abc/dashboard')
		})
	})

	describe('createClientRoutePath', () => {
		it('создает путь для клиентского роута без параметра', () => {
			const path = createClientRoutePath('business-123', 'book')
			expect(path).toBe('/business/business-123/book')
		})

		it('создает путь для клиентского роута с параметром', () => {
			const path = createClientRoutePath('business-123', 'book', 'service-456')
			expect(path).toBe('/business/business-123/book/service-456')
		})

		it('создает путь для просмотра бизнеса', () => {
			const path = createClientRoutePath('business-123', 'view')
			expect(path).toBe('/business/business-123/view')
		})

		it('корректно обрабатывает параметры с дефисами', () => {
			const path = createClientRoutePath('business-123', 'book', 'service-456-xyz')
			expect(path).toBe('/business/business-123/book/service-456-xyz')
		})
	})

	describe('RoutePath types', () => {
		it('проверяет типы AdminRoutePath', () => {
			const adminPaths: AdminRoutePath[] = [
				'/businesses/:businessId/dashboard',
				'/businesses/:businessId/calendar',
				'/businesses/:businessId/bookings',
				'/businesses/:businessId/services',
				'/businesses/:businessId/staff',
				'/businesses/:businessId/clients',
				'/businesses/:businessId/notifications',
				'/businesses/:businessId/settings',
				'/businesses/:businessId/availability',
				'/businesses/:businessId/notification-templates',
			]

			expect(adminPaths.length).toBe(10)
		})

		it('проверяет типы ClientRoutePath', () => {
			const clientPaths: ClientRoutePath[] = [
				'/business/:businessId',
				'/business/:businessId/book/:serviceId',
				'/business/:businessId/booking/:bookingId/success',
			]

			expect(clientPaths.length).toBe(3)
		})

		it('проверяет типы RoutePath', () => {
			const routes: RoutePath[] = [
				'/',
				'/businesses',
				'/businesses/:businessId/dashboard',
				'/business/:businessId',
			]

			expect(routes.length).toBe(4)
		})
	})
})

