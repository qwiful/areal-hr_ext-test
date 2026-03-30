const pool = require('../db')

async function logChange(userId, object, action, data) {
  if (!userId) {
    console.warn('logChange: userId is required')
    return
  }

  const logData = {
    action,
    timestamp: new Date().toISOString(),
    data,
  }

  try {
    await pool.query(
      `INSERT INTO history_changes (add_at, who_changed, object, changed_field)
       VALUES (CURRENT_TIMESTAMP, $1, $2, $3)`,
      [userId, object, JSON.stringify(logData)],
    )
  } catch (err) {
    console.error('Ошибка записи в историю:', err)
  }
}

function autoLog(entityName) {
  return (req, res, next) => {
    const originalJson = res.json
    const originalStatus = res.status

    let responseData = null
    let responseStatus = 200

    res.status = function (code) {
      responseStatus = code
      return originalStatus.call(this, code)
    }

    res.json = function (data) {
      responseData = data
      let action = ''
      let objectData = null

      if (req.method === 'POST' && (responseStatus === 201 || responseStatus === 200)) {
        action = 'Создание'
        objectData = responseData
      } else if (req.method === 'PUT' && responseStatus === 200) {
        action = 'Обновление'
        objectData = { updated: responseData }
      } else if (req.method === 'DELETE' && responseStatus === 200) {
        action = 'Удаление (мягкое)'
        objectData = responseData
      }

      if (action && req.user?.id) {
        logChange(req.user.id, entityName, action, objectData)
      }

      return originalJson.call(this, data)
    }

    next()
  }
}

module.exports = { logChange, autoLog }
