const Joi = require('joi')
const { logChange } = require('../middleware/historyLogger')

const createPositionSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
})

const updatePositionSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
})

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})

module.exports = (pool) => ({
  createPosition: async (req, res, next) => {
    const { error } = createPositionSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name } = req.body

    try {
      const result = await pool.query(
        `INSERT INTO positions (name)
         VALUES ($1)
         RETURNING *`,
        [name],
      )

      await logChange(req.user.id, 'Должность', 'Создание', result.rows[0])

      res.status(201).json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },

  getPositions: async (req, res, next) => {
    try {
      const result = await pool.query('SELECT * FROM positions WHERE delete_at IS NULL ORDER BY id')
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  getPositionById: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query(
        'SELECT * FROM positions WHERE id = $1 AND delete_at IS NULL',
        [id],
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Должность не найдена' })
      }
      res.json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },

  updatePosition: async (req, res, next) => {
    const { error: idError } = idSchema.validate(req.params)
    if (idError) {
      return res.status(400).json({ error: idError.details[0].message })
    }

    const { error } = updatePositionSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params
    const { name } = req.body

    try {
      const oldResult = await pool.query(
        'SELECT * FROM positions WHERE id = $1 AND delete_at IS NULL',
        [id],
      )
      if (oldResult.rows.length === 0) {
        return res.status(404).json({ error: 'Должность не найдена' })
      }
      const oldData = oldResult.rows[0]

      const updateResult = await pool.query(
        `UPDATE positions
         SET name = $1, update_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND delete_at IS NULL
         RETURNING *`,
        [name, id],
      )

      await logChange(req.user.id, 'Должность', 'Обновление', {
        old: oldData,
        new: updateResult.rows[0],
      })

      res.json(updateResult.rows[0])
    } catch (err) {
      next(err)
    }
  },

  deletePosition: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const oldResult = await pool.query(
        'SELECT * FROM positions WHERE id = $1 AND delete_at IS NULL',
        [id],
      )
      if (oldResult.rows.length === 0) {
        return res.status(404).json({ error: 'Должность не найдена' })
      }
      const oldData = oldResult.rows[0]

      await pool.query(
        'UPDATE positions SET delete_at = CURRENT_TIMESTAMP WHERE id = $1 AND delete_at IS NULL',
        [id],
      )

      await logChange(req.user.id, 'Должность', 'Удаление (мягкое)', oldData)

      res.json({ message: 'Должность помечена как удалённая' })
    } catch (err) {
      next(err)
    }
  },
})
