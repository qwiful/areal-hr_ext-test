const Joi = require('joi')

const querySchema = Joi.object({
  object: Joi.string().max(100),
  limit: Joi.number().integer().positive().max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
})

module.exports = (pool) => ({
  getHistory: async (req, res, next) => {
    const { error, value } = querySchema.validate(req.query)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { object, limit, offset } = value

    try {
      let query = `
        SELECT hc.*,
          s.surname || ' ' || s.name AS specialist_name
        FROM history_changes hc
        LEFT JOIN specialist s ON hc.who_changed = s.id
      `
      const values = []
      let paramIndex = 1

      if (object) {
        query += ` WHERE hc.object = $${paramIndex++}`
        values.push(object)
      }

      query += ` ORDER BY hc.add_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
      values.push(limit, offset)

      const result = await pool.query(query, values)
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  getHistoryById: async (req, res, next) => {
    const { id } = req.params
    const parsedId = Number(id)
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ error: 'Некорректный ID' })
    }

    try {
      const result = await pool.query(
        `SELECT hc.*,
          s.surname || ' ' || s.name AS specialist_name
        FROM history_changes hc
        LEFT JOIN specialist s ON hc.who_changed = s.id
        WHERE hc.id = $1`,
        [parsedId],
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Запись не найдена' })
      }
      res.json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },
})
