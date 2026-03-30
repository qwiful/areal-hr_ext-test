const express = require('express')
const cors = require('cors')
const path = require('path')
const session = require('express-session')
require('dotenv').config()

const passport = require('./config/passport')
const pool = require('./db.js')

const organizationsRoutes = require('./routes/organizations.js')
const departmentsRoutes = require('./routes/departments.js')
const positionsRoutes = require('./routes/positions.js')
const workersRoutes = require('./routes/workers.js')
const filesRoutes = require('./routes/files.js')
const personnelOperationsRoutes = require('./routes/personnel-operations.js')
const historyRoutes = require('./routes/history-changes.js')
const specialistsRoutes = require('./routes/specialists.js')
const authRoutes = require('./routes/auth.js')

const errorHandler = require('./middleware/errorHandler')
const isAuthenticated = require('./middleware/auth')
const requireRole = require('./middleware/roles')
const { autoLog } = require('./middleware/historyLogger')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-me'
if (!process.env.SESSION_SECRET) {
  console.warn('ВНИМАНИЕ: SESSION_SECRET не задан в .env, используется значение по умолчанию')
}
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
)
app.use(passport.initialize())
app.use(passport.session())

app.use('/api/auth', authRoutes)

app.use('/api/organizations', isAuthenticated, autoLog('Организация'), organizationsRoutes)
app.use('/api/departments', isAuthenticated, autoLog('Отдел'), departmentsRoutes)
app.use('/api/positions', isAuthenticated, autoLog('Должность'), positionsRoutes)
app.use('/api/workers', isAuthenticated, autoLog('Сотрудник'), workersRoutes)
app.use('/api/files', isAuthenticated, autoLog('Файл'), filesRoutes)
app.use(
  '/api/personnel-operations',
  isAuthenticated,
  autoLog('Кадровая операция'),
  personnelOperationsRoutes,
)
app.use('/api/history', isAuthenticated, historyRoutes)
app.use('/api/specialists', isAuthenticated, requireRole('admin'), specialistsRoutes)

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
