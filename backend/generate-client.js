#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Читаем OpenAPI спецификацию
const openApiSpec = JSON.parse(fs.readFileSync('openapi.json', 'utf8'));

// Создаем типы из схем
function generateTypes(schemas) {
  let types = '';

  for (const [name, schema] of Object.entries(schemas)) {
    if (schema.type === 'object') {
      types += `export interface ${name} {\n`;

      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(
          schema.properties,
        )) {
          const required = schema.required?.includes(propName) ? '' : '?';
          const type = getTypeFromSchema(propSchema);
          types += `  ${propName}${required}: ${type};\n`;
        }
      }

      types += `}\n\n`;
    } else if (schema.enum) {
      types += `export type ${name} = ${schema.enum.map((e) => `'${e}'`).join(' | ')};\n\n`;
    }
  }

  return types;
}

function getTypeFromSchema(schema) {
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    return refName;
  }

  if (schema.type === 'string') {
    if (schema.enum) {
      return schema.enum.map((e) => `'${e}'`).join(' | ');
    }
    return 'string';
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return 'number';
  }

  if (schema.type === 'boolean') {
    return 'boolean';
  }

  if (schema.type === 'array') {
    const itemType = getTypeFromSchema(schema.items);
    return `${itemType}[]`;
  }

  if (schema.type === 'object') {
    return 'object';
  }

  return 'any';
}

// Создаем API клиент
function generateApiClient(paths) {
  let client = `import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as models from './models';

export class ApiClient {
  private api: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3001') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Добавляем токен к каждому запросу
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
      return config;
    });

    // Обработка ошибок
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

`;

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      const operationId = operation.operationId;
      const summary = operation.summary || operationId;

      // Параметры пути
      const pathParams = [];
      const queryParams = [];
      const bodyParam =
        operation.requestBody?.content?.['application/json']?.schema;

      if (operation.parameters) {
        for (const param of operation.parameters) {
          if (param.in === 'path') {
            pathParams.push(param.name);
          } else if (param.in === 'query') {
            queryParams.push(param.name);
          }
        }
      }

      // Генерируем сигнатуру метода
      let methodSignature = `  async ${operationId}(`;
      const params = [];

      // Параметры пути
      for (const param of pathParams) {
        params.push(`${param}: string`);
      }

      // Query параметры
      if (queryParams.length > 0) {
        params.push(
          `queryParams?: { ${queryParams.map((p) => `${p}?: any`).join(', ')} }`,
        );
      }

      // Body параметр
      if (bodyParam) {
        const bodyType = getTypeFromSchema(bodyParam);
        params.push(`data?: ${bodyType}`);
      }

      methodSignature += params.join(', ');
      methodSignature += `): Promise<any> {\n`;

      // Генерируем тело метода
      let methodBody = `    const response: AxiosResponse = await this.api.${method}(\`${path}\``;

      // Заменяем параметры пути
      let processedPath = path;
      for (const param of pathParams) {
        processedPath = processedPath.replace(`{${param}}`, `\${${param}}`);
      }

      if (processedPath !== path) {
        methodBody = methodBody.replace(path, processedPath);
      }

      // Добавляем параметры
      const methodParams = [];
      if (queryParams.length > 0) {
        methodParams.push('{ params: queryParams }');
      }
      if (bodyParam) {
        methodParams.push('data');
      }

      if (methodParams.length > 0) {
        methodBody += `, ${methodParams.join(', ')}`;
      }

      methodBody += `);\n    return response.data;\n  }\n\n`;

      client += methodSignature + methodBody;
    }
  }

  client += `}

export const apiClient = new ApiClient();
`;

  return client;
}

// Генерируем файлы
const types = generateTypes(openApiSpec.components?.schemas || {});
const client = generateApiClient(openApiSpec.paths);

// Записываем файлы
fs.writeFileSync('../frontend/src/generated/api/models.ts', types);
fs.writeFileSync('../frontend/src/generated/api/index.ts', client);

console.log('✅ API клиент сгенерирован успешно!');
console.log('📁 Файлы созданы в frontend/src/generated/api/');
