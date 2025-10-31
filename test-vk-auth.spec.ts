import { test, expect } from '@playwright/test';

test.describe('VK Auth Test', () => {
  test('проверка VK авторизации', async ({ page }) => {
    // Перехватываем сетевые запросы для диагностики
    page.on('request', request => {
      if (request.url().includes('/auth/vk')) {
        console.log('🔵 VK Auth Request:', {
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
        });
      }
    });

    page.on('response', response => {
      if (response.url().includes('/auth/vk')) {
        console.log('🟢 VK Auth Response:', {
          status: response.status(),
          statusText: response.statusText(),
          url: response.url(),
        });
        response.text().then(text => {
          console.log('📄 Response body:', text);
        }).catch(() => {});
      }
    });

    // Перехватываем console.log для просмотра логов
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('VK') || text.includes('auth') || text.includes('error') || text.includes('error')) {
        console.log('📱 Browser console:', msg.type(), text);
      }
    });

    // Перехватываем ошибки
    page.on('pageerror', error => {
      console.error('❌ Page error:', error.message);
    });

    // Открываем страницу логина
    await page.goto('http://localhost:5173/login');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем наличие кнопки VK авторизации
    const vkButton = page.locator('button').filter({ hasText: /вк/i }).or(page.locator('button').filter({ hasText: /vk/i }));
    
    console.log('🔍 Ищем кнопку VK...');
    const buttonText = await page.locator('button').allTextContents();
    console.log('📋 Все кнопки на странице:', buttonText);
    
    // Делаем скриншот для диагностики
    await page.screenshot({ path: 'screenshot-before-click.png' });
    
    // Проверяем, есть ли кнопка VK
    const vkButtonCount = await vkButton.count();
    console.log(`🔘 Найдено кнопок VK: ${vkButtonCount}`);
    
    if (vkButtonCount > 0) {
      console.log('✅ Кнопка VK найдена, кликаем...');
      
      // Кликаем на кнопку VK
      await vkButton.first().click();
      
      // Ждем немного для обработки клика
      await page.waitForTimeout(2000);
      
      // Делаем скриншот после клика
      await page.screenshot({ path: 'screenshot-after-click.png' });
      
      // Проверяем ошибки на странице
      const errorMessages = await page.locator('[role="alert"], .error, [class*="error"]').allTextContents();
      if (errorMessages.length > 0) {
        console.log('⚠️ Ошибки на странице:', errorMessages);
      }
      
      // Ждем завершения запросов
      await page.waitForTimeout(3000);
      
    } else {
      console.log('❌ Кнопка VK не найдена!');
      
      // Показываем весь HTML для диагностики
      const html = await page.content();
      console.log('📄 HTML страницы (первые 2000 символов):', html.substring(0, 2000));
    }
  });
});

