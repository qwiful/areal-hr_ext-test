const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.connect((err, client, release) => {
  if (err) {
    console.error('Ошибка подключения к БД:', err.stack)
  } else {
    console.log('Подключение к БД установлено')
    release()
  }
})

module.exports = pool
