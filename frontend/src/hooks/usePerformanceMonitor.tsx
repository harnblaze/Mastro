import { useEffect, useRef } from 'react';
import React from 'react';


// Хук для мониторинга производительности компонентов
export const usePerformanceMonitor = (componentName: string, enabled: boolean = true) => {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);
  const updateCount = useRef<number>(0);
  const lastRenderTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    // Засекаем время монтирования
    if (mountTime.current === 0) {
      mountTime.current = performance.now();
    }

    // Засекаем время рендера
    renderStartTime.current = performance.now();
    updateCount.current += 1;

    return () => {
      // Вычисляем время рендера
      const renderTime = performance.now() - renderStartTime.current;
      lastRenderTime.current = renderTime;

      // Логируем метрики в development режиме
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Логируем только медленные рендеры (> 16ms для 60fps)
        if (renderTime > 16) {
          console.warn(`🐌 Slow render detected in ${componentName}:`, {
            renderTime: `${renderTime.toFixed(2)}ms`,
            updateCount: updateCount.current,
            mountTime: mountTime.current ? `${mountTime.current.toFixed(2)}ms` : 'N/A',
          });
        } else if (updateCount.current === 1) {
          console.log(`✅ Component ${componentName} mounted:`, {
            mountTime: `${mountTime.current.toFixed(2)}ms`,
          });
        }
      }
    };
  });

  return {
    renderTime: lastRenderTime.current,
    updateCount: updateCount.current,
    mountTime: mountTime.current,
  };
};

// HOC для автоматического мониторинга производительности
export const withPerformanceMonitor = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    usePerformanceMonitor(name);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceMonitor(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Утилита для измерения времени выполнения функций
export const measurePerformance = <T extends (...args: any[]) => any>(
  fn: T,
  functionName: string,
  enabled: boolean = true
): T => {
  if (!enabled) return fn;

  return ((...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = fn(...args);
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Логируем только медленные функции (> 5ms)
      if (executionTime > 5) {
        console.warn(`🐌 Slow function execution: ${functionName}`, {
          executionTime: `${executionTime.toFixed(2)}ms`,
          args: args.length > 0 ? args : 'No arguments',
        });
      }
    }

    return result;
  }) as T;
};

// Утилита для мониторинга bundle size
export const logBundleInfo = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Получаем информацию о размере bundle
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    
    console.log('📦 Bundle Info:', {
      scripts: scripts.length,
      styles: styles.length,
      totalResources: scripts.length + styles.length,
    });

    // Мониторим загрузку ресурсов
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          if (resource.duration > 1000) { // Логируем медленные ресурсы
            console.warn(`🐌 Slow resource loading:`, {
              name: resource.name,
              duration: `${resource.duration.toFixed(2)}ms`,
              size: resource.transferSize ? `${(resource.transferSize / 1024).toFixed(2)}KB` : 'Unknown',
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }
};

// Утилита для мониторинга памяти
export const logMemoryUsage = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log('🧠 Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
    });
  }
};

// Инициализация мониторинга производительности
export const initPerformanceMonitoring = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    logBundleInfo();
    logMemoryUsage();

    // Мониторим память каждые 30 секунд
    setInterval(logMemoryUsage, 30000);
  }
};
