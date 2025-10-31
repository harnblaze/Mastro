import React, { useState, Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { View, Panel, PanelHeader } from '@vkontakte/vkui';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen, ErrorBoundary, NotFoundPage } from '../components';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

// Lazy loading для всех страниц
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const VkCallbackPage = lazy(() => import('../pages/VkCallbackPage').then(m => ({ default: m.VkCallbackPage })));
const BusinessListPage = lazy(() => import('../pages/BusinessListPage').then(m => ({ default: m.BusinessListPage })));

// Lazy loading для админских страниц
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CalendarPage = lazy(() => import('../pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const BookingsPage = lazy(() => import('../pages/BookingsPage').then(m => ({ default: m.BookingsPage })));
const ServicesPage = lazy(() => import('../pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const StaffPage = lazy(() => import('../pages/StaffPage').then(m => ({ default: m.StaffPage })));
const ClientsPage = lazy(() => import('../pages/ClientsPage').then(m => ({ default: m.ClientsPage })));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AvailabilityPage = lazy(() => import('../pages/AvailabilityPage').then(m => ({ default: m.AvailabilityPage })));
const NotificationTemplatesPage = lazy(() => import('../pages/NotificationTemplatesPage').then(m => ({ default: m.NotificationTemplatesPage })));

// Lazy loading для клиентских страниц
const BusinessCardPage = lazy(() => import('../pages/BusinessCardPage').then(m => ({ default: m.BusinessCardPage })));
const BookingPage = lazy(() => import('../pages/BookingPage').then(m => ({ default: m.BookingPage })));
const BookingSuccessPage = lazy(() => import('../pages/BookingSuccessPage').then(m => ({ default: m.BookingSuccessPage })));

// Маппинг компонентов для админских роутов
const adminComponents = {
  dashboard: DashboardPage,
  calendar: CalendarPage,
  bookings: BookingsPage,
  services: ServicesPage,
  staff: StaffPage,
  clients: ClientsPage,
  notifications: NotificationsPage,
  settings: SettingsPage,
  availability: AvailabilityPage,
  'notification-templates': NotificationTemplatesPage,
} as const;

// Мемоизированный AdminLayout для оптимизации производительности
const AdminLayout = memo<{ children: React.ReactNode }>(({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { businessId } = useParams<{ businessId: string }>();
  const { logout } = useAuth();
  
  // Мониторинг производительности
  usePerformanceMonitor('AdminLayout');

  if (!businessId) {
    return (
      <ErrorBoundary>
        <div>Business ID not found</div>
      </ErrorBoundary>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        businessId={businessId} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <div style={{ 
        flex: 1, 
        minHeight: '100vh',
        overflowX: 'hidden'
      }}>
        <Header
          title="Админ-панель"
          businessId={businessId}
          onMenuClick={() => setSidebarOpen(true)}
          showLogout={true}
          onLogout={logout}
        />
        <div className="main-container" style={{ 
          padding: '20px', 
          maxWidth: '1200px', 
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Suspense fallback={<LoadingScreen />}>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  );
});

export const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Мониторинг производительности основного роутера
  usePerformanceMonitor('AppRouter');

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* VK Callback (доступен без авторизации) */}
          <Route 
            path="/vk-callback" 
            element={
              <Suspense fallback={<LoadingScreen />}>
                <VkCallbackPage />
              </Suspense>
            } 
          />
          
          {/* Неавторизованные пользователи */}
          {!isAuthenticated ? (
            <Route 
              path="*" 
              element={
                <View activePanel="login">
                  <Panel id="login">
                    <PanelHeader>Mastro</PanelHeader>
                    <Suspense fallback={<LoadingScreen />}>
                      <LoginPage />
                    </Suspense>
                  </Panel>
                </View>
              } 
            />
          ) : (
            <>
              {/* Авторизованные пользователи */}
              <Route path="/" element={<Navigate to="/businesses" replace />} />
              <Route 
                path="/businesses" 
                element={
                  <View activePanel="main">
                    <Panel id="main">
                      <Suspense fallback={<LoadingScreen />}>
                        <BusinessListPage />
                      </Suspense>
                    </Panel>
                  </View>
                } 
              />
              
              {/* Клиентские страницы (без админ-панели) */}
              <Route 
                path="/business/:businessId" 
                element={
                  <View activePanel="main">
                    <Panel id="main">
                      <Suspense fallback={<LoadingScreen />}>
                        <BusinessCardPage />
                      </Suspense>
                    </Panel>
                  </View>
                } 
              />
              <Route 
                path="/business/:businessId/book/:serviceId" 
                element={
                  <View activePanel="main">
                    <Panel id="main">
                      <Suspense fallback={<LoadingScreen />}>
                        <BookingPage />
                      </Suspense>
                    </Panel>
                  </View>
                } 
              />
              <Route 
                path="/business/:businessId/booking/:bookingId/success" 
                element={
                  <View activePanel="main">
                    <Panel id="main">
                      <Suspense fallback={<LoadingScreen />}>
                        <BookingSuccessPage />
                      </Suspense>
                    </Panel>
                  </View>
                } 
              />
              
              {/* Админские страницы с динамической генерацией роутов */}
              <Route path="/businesses/:businessId" element={
                <AdminLayout>
                  <Suspense fallback={<LoadingScreen />}>
                    <BusinessCardPage />
                  </Suspense>
                </AdminLayout>
              } />
              
              {/* Динамически генерируемые админские роуты */}
              {Object.entries(adminComponents).map(([route, Component]) => (
                <Route 
                  key={route}
                  path={`/businesses/:businessId/${route}`} 
                  element={
                    <AdminLayout>
                      <Component />
                    </AdminLayout>
                  } 
                />
              ))}
              
              {/* 404 страница для несуществующих роутов */}
              <Route path="*" element={<NotFoundPage />} />
            </>
          )}
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};
