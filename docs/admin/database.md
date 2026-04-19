# База данных и миграции

## Схема базы данных

ER-диаграмма доступна в файле `docs/drawio/db.drawio` (простотр в виде схемы возможен после загрузки файла на сайте https://www.drawio.com/). Основные таблицы:

- `organizations`, `departments`, `positions`
- `workers`, `passports`, `address`, `files`
- `personnel_operations`
- `authorization`, `role`, `specialist`
- `history_changes`

## Миграции

Миграции находятся в папке `api/migrations`. Они написаны с использованием `node-pg-migrate`.

### Применение миграций

```bash
cd api
npm run migrate:up
```

### Откат последней миграции

```bash
npm run migrate:down
```

### Мягкое удаление

Во всех основных таблицах есть поле delete_at (timestamp). Записи с непустым delete_at считаются удалёнными и не отображаются в интерфейсе. Физически они остаются в БД.
