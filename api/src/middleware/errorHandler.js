module.exports = (err, req, res, _next) => {
  console.error('Ошибка:', err.stack || err)

  const status = err.status || 500
  const message = err.message || 'Внутренняя ошибка сервера'

  res.status(status).json({ error: message })
}
