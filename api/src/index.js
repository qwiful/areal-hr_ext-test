const express = require('express')
const cors = require('cors')
require('dotenv').config()

const pool = require('./db.js')

const organizationsRoutes = require('./routes/organizations.js')
const departmentsRoutes = require('./routes/departments.js')
const positionsRoutes = require('./routes/positions.js')
//const workersRoutes = require('./routes/workers.js')
//const filesRoutes = require('./routes/files.js')
//const personnelOperationsRoutes = require('./routes/personnel-operations.js')
//const specialistRoutes = require('./routes/specialist.js')
//const authRoutes = require('./routes/auth.js')
//const historyRoutes = require('./routes/history-changes.js')

const errorHandler = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/organizations', organizationsRoutes)
app.use('/api/departments', departmentsRoutes)
app.use('/api/positions', positionsRoutes)
//app.use('/api/workers', workersRoutes)
//app.use('/api/files', filesRoutes)
//app.use('/api/personnel-operations', personnelOperationsRoutes)
//app.use('/api/specialist', specialistRoutes)
//app.use('/api/auth', authRoutes)
//app.use('/api/history', historyRoutes)

app.get('/', (req, res) => {
  res.send('API менеджера запущен')
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})

process.on('SIGINT', async () => {
  await pool.end()
  console.log('Пул соединений закрыт')
  // eslint-disable-next-line no-process-exit
  process.exit(0)
})
