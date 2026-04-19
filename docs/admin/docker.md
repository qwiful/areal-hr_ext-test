# Запуск через Docker

Проект полностью контейнеризирован. Для запуска потребуется Docker и Docker Compose.

## 1. Подготовка

Убедитесь, что в корне проекта есть файлы:

- `docker-compose.yml`
- `containers/api/Dockerfile`
- `containers/app/Dockerfile`
- `containers/app/nginx.conf`

## 2. Переменные окружения

Создайте файл `.env` в корне проекта (или используйте значения по умолчанию в `docker-compose.yml`). Пример:

- DB_USER=postgres
- DB_PASSWORD=postgres
- DB_NAME=hr_database
- SESSION_SECRET=supersecretkey

## 3. Запуск

```bash
docker compose up --build -d
```

После запуска в браузере открыть: http://localhost.

## 4. Остановка и удаление коннтейнеров

```bash
docker compose down
```

Чтобы удалить тома с данными БД и загруженными файлами:

```bash
docker compose down -v
```
