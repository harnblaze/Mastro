#!/bin/bash

# Скрипт для запуска всех тестов бэкенда
# Использование: ./run-tests.sh [unit|integration|e2e|all]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка наличия Node.js и npm
check_dependencies() {
    log "Проверка зависимостей..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js не установлен"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm не установлен"
        exit 1
    fi
    
    success "Зависимости проверены"
}

# Установка зависимостей
install_dependencies() {
    log "Установка зависимостей..."
    npm install
    success "Зависимости установлены"
}

# Подготовка тестовой среды
prepare_test_env() {
    log "Подготовка тестовой среды..."
    
    # Установка переменных окружения для тестов
    export NODE_ENV=test
    export DATABASE_URL=file:./test.db
    export JWT_SECRET=test-secret-key
    
    # Подготовка тестовой базы данных
    npm run test:prepare
    
    success "Тестовая среда подготовлена"
}

# Очистка после тестов
cleanup() {
    log "Очистка тестовых файлов..."
    
    # Удаление тестовой базы данных
    if [ -f "test.db" ]; then
        rm test.db
    fi
    
    # Удаление файлов покрытия (опционально)
    if [ -d "coverage" ]; then
        rm -rf coverage
    fi
    
    success "Очистка завершена"
}

# Запуск unit тестов
run_unit_tests() {
    log "Запуск unit тестов..."
    npm run test:unit
    success "Unit тесты завершены"
}

# Запуск интеграционных тестов
run_integration_tests() {
    log "Запуск интеграционных тестов..."
    npm run test:integration
    success "Интеграционные тесты завершены"
}

# Запуск E2E тестов
run_e2e_tests() {
    log "Запуск E2E тестов..."
    npm run test:e2e
    success "E2E тесты завершены"
}

# Запуск всех тестов
run_all_tests() {
    log "Запуск всех тестов..."
    npm run test:all
    success "Все тесты завершены"
}

# Запуск тестов с покрытием
run_coverage_tests() {
    log "Запуск тестов с покрытием кода..."
    npm run test:cov
    
    # Открытие отчета о покрытии в браузере (если доступно)
    if command -v open &> /dev/null; then
        open coverage/lcov-report/index.html
    elif command -v xdg-open &> /dev/null; then
        xdg-open coverage/lcov-report/index.html
    fi
    
    success "Тесты с покрытием завершены"
}

# Показать справку
show_help() {
    echo "Использование: $0 [КОМАНДА]"
    echo ""
    echo "Команды:"
    echo "  unit         - Запустить только unit тесты"
    echo "  integration  - Запустить только интеграционные тесты"
    echo "  e2e          - Запустить только E2E тесты"
    echo "  all          - Запустить все тесты (по умолчанию)"
    echo "  coverage     - Запустить тесты с покрытием кода"
    echo "  help         - Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0 unit"
    echo "  $0 all"
    echo "  $0 coverage"
}

# Основная функция
main() {
    local command=${1:-all}
    
    case $command in
        "unit")
            check_dependencies
            install_dependencies
            prepare_test_env
            run_unit_tests
            ;;
        "integration")
            check_dependencies
            install_dependencies
            prepare_test_env
            run_integration_tests
            ;;
        "e2e")
            check_dependencies
            install_dependencies
            prepare_test_env
            run_e2e_tests
            ;;
        "all")
            check_dependencies
            install_dependencies
            prepare_test_env
            run_all_tests
            ;;
        "coverage")
            check_dependencies
            install_dependencies
            prepare_test_env
            run_coverage_tests
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Неизвестная команда: $command"
            show_help
            exit 1
            ;;
    esac
}

# Обработка сигналов для корректной очистки
trap cleanup EXIT

# Запуск основной функции
main "$@"
