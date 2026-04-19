# Конфигурация

## Переменные окружения (файл `.env` в папке `api`)

| Переменная       | Описание                          | Пример                                                      |
| ---------------- | --------------------------------- | ----------------------------------------------------------- |
| `PORT`           | Порт бэкенда                      | `3000`                                                      |
| `DATABASE_URL`   | Строка подключения к PostgreSQL   | `postgresql://postgres:postgres@localhost:5432/hr_database` |
| `SESSION_SECRET` | Секретный ключ для подписи сессий | `сгенерируйте случайную строку`                             |

### Дополнительные параметры (опционально)

Можно использовать отдельные переменные вместо `DATABASE_URL`:

- DB_HOST=localhost
- DB_PORT=5432
- DB_USER=postgres
- DB_PASSWORD=postgres
- DB_NAME=hr_database

## Настройка CORS

В `api/src/index.js`:

```javascript
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
```

## Настройка сессий

В `api/src/index.js`:

```javascript
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
)
```
