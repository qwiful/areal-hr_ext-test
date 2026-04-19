# Установка и запуск

## Клонирование репозитория

```bash
git clone git@github.com:qwiful/areal-hr-ext-test.git
cd areal-hr-ext-test
```

## Найстройка бэкенда

- Установка зависимостей

```bash
cd api
npm install
cp .env.example .env
```

отредактируйте .env (см. раздел Конфигурация)

- Применение миграций

```bash
npm run migrate:up
```

- Запуск сервера

```bash
npm run start
```

Сервер будет доступен на http://localhost:3000.

## Настройка фронтенда

В новом терминале:

```bash
cd app
npm install
npm run dev
```

Фронтенд запустится на http://localhost:5173 (или другом порту, если 5173 занят).

## Проверка работы

- Откройте http://localhost:5173 – должна открыться страница логина.

- Используйте учётные данные администратора (логин: admin, пароль: admin – если не меняли).
