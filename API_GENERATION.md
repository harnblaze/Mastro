# Авто-генерация типизированных API контроллеров

Система автоматической генерации типизированных API клиентов из Swagger/OpenAPI спецификации.

## 🚀 Возможности

- ✅ Автоматическая генерация типизированных API клиентов
- ✅ Полная типобезопасность между фронтендом и бэкендом
- ✅ Автоматическое обновление при изменениях API
- ✅ Swagger документация доступна по адресу `/api/docs`
- ✅ Простая интеграция в существующий код

## 📁 Структура файлов

```
backend/
├── generate-client.js          # Генератор клиента
├── openapi-generator-config.json # Конфигурация генератора
├── openapi.json                # OpenAPI спецификация
└── package.json                # Скрипты генерации

frontend/src/
├── generated/api/              # Сгенерированные файлы
│   ├── models.ts              # Типы и интерфейсы
│   └── index.ts               # API клиент
└── services/
    ├── api.ts                 # Старый API сервис
    └── typedApi.ts            # Новый типизированный API сервис
```

## 🔧 Использование

### Генерация клиента

```bash
# Из директории backend
npm run generate:client
```

### Интеграция в компоненты

```typescript
import { typedApiService } from '../services/typedApi';
import type { CreateBusinessDto } from '../generated/api/models';

// Использование с полной типизацией
const createBusiness = async (data: CreateBusinessDto) => {
  try {
    const business = await typedApiService.createBusiness(data);
    return business;
  } catch (error) {
    console.error('Ошибка создания бизнеса:', error);
  }
};
```

## 🔄 Автоматическое обновление

### При изменении API в бэкенде:

1. Добавьте Swagger декораторы к новым контроллерам/методам
2. Запустите генерацию: `npm run generate:client`
3. Обновите типизированный сервис при необходимости

### Swagger декораторы

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Business')
@ApiBearerAuth()
@Controller('api/v1/businesses')
export class BusinessController {
  @ApiOperation({ summary: 'Создать бизнес' })
  @ApiResponse({ status: 201, description: 'Бизнес создан' })
  @Post()
  create(@Body() createBusinessDto: CreateBusinessDto) {
    // ...
  }
}
```

### DTO с типами

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({ description: 'Название бизнеса', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Адрес бизнеса', required: false })
  @IsOptional()
  @IsString()
  address?: string;
}
```

## 📋 Скрипты

- `npm run generate:client` - Полная генерация (запуск бэкенда + генерация)
- `npm run generate:client-only` - Только генерация из существующей спецификации

## 🎯 Преимущества

1. **Типобезопасность**: Автоматическая проверка типов на этапе компиляции
2. **Синхронизация**: API клиент всегда соответствует бэкенду
3. **Документация**: Swagger UI для тестирования API
4. **Производительность**: Меньше ошибок времени выполнения
5. **DX**: Лучший опыт разработки с автодополнением

## 🔧 Настройка

### Конфигурация генератора

Файл `openapi-generator-config.json`:

```json
{
  "generator-cli": {
    "version": "7.0.1",
    "generators": {
      "typescript-axios": {
        "generatorName": "typescript-axios",
        "output": "../frontend/src/generated/api",
        "glob": "openapi.json",
        "additionalProperties": {
          "npmName": "@mastro/api-client",
          "supportsES6": true,
          "withSeparateModelsAndApi": true
        }
      }
    }
  }
}
```

## 🚨 Важные моменты

1. **Порядок генерации**: Сначала запустите бэкенд для создания OpenAPI спецификации
2. **Типы**: Всегда используйте типы из `generated/api/models`
3. **Обновление**: При изменении API обязательно перегенерируйте клиент
4. **Версионирование**: Следите за версиями генератора

## 🔍 Отладка

### Проверка OpenAPI спецификации

```bash
# Проверьте, что спецификация создалась
cat backend/openapi.json | jq '.paths | keys'
```

### Проверка сгенерированных типов

```bash
# Проверьте типы
cat frontend/src/generated/api/models.ts
```

## 📚 Дополнительные ресурсы

- [OpenAPI Specification](https://swagger.io/specification/)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [TypeScript Axios Generator](https://openapi-generator.tech/docs/generators/typescript-axios/)
