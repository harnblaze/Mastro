import type { ComponentType } from 'react';

// Типизированные пути для роутов
export type AdminRoutePath = 
  | '/businesses/:businessId/dashboard'
  | '/businesses/:businessId/calendar'
  | '/businesses/:businessId/bookings'
  | '/businesses/:businessId/services'
  | '/businesses/:businessId/staff'
  | '/businesses/:businessId/clients'
  | '/businesses/:businessId/notifications'
  | '/businesses/:businessId/settings'
  | '/businesses/:businessId/availability'
  | '/businesses/:businessId/notification-templates';

export type ClientRoutePath = 
  | '/business/:businessId'
  | '/business/:businessId/book/:serviceId'
  | '/business/:businessId/booking/:bookingId/success';

export type PublicRoutePath = 
  | '/'
  | '/businesses';

export type RoutePath = AdminRoutePath | ClientRoutePath | PublicRoutePath;

// Конфигурация роута
export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  title: string;
  icon?: string;
  isAdmin?: boolean;
  isClient?: boolean;
  isPublic?: boolean;
}

// Утилиты для работы с роутами
export const createAdminRoutePath = (businessId: string, route: string): string => 
  `/businesses/${businessId}/${route}`;

export const createClientRoutePath = (businessId: string, route: string, param?: string): string => {
  if (param) {
    return `/business/${businessId}/${route}/${param}`;
  }
  return `/business/${businessId}/${route}`;
};
