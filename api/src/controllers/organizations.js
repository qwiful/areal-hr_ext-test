const Joi = require('joi')

const createOrganizationSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  comment: Joi.string().max(250).allow('', null),
})

const updateOrganizationSchema = Joi.object({
  name: Joi.string().min(1).max(50),
  comment: Joi.string().max(250).allow('', null),
}).min(1)

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})

module.exports = (pool) => ({
  createOrganization: async (req, res, next) => {
    const { error } = createOrganizationSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, comment } = req.body

    try {
      const result = await pool.query(
        `INSERT INTO organizations (name, comment)
         VALUES ($1, $2)
         RETURNING *`,
        [name, comment || ''],
      )

      res.status(201).json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },

  getOrganizations: async (req, res, next) => {
    try {
      const result = await pool.query(
        'SELECT * FROM organizations WHERE delete_at IS NULL ORDER BY id',
      )
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  getOrganizationById: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query(
        'SELECT * FROM organizations WHERE id = $1 AND delete_at IS NULL',
        [id],
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Организация не найдена' })
      }
      res.json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },

  updateOrganization: async (req, res, next) => {
    const { error: idError } = idSchema.validate(req.params)
    if (idError) {
      return res.status(400).json({ error: idError.details[0].message })
    }

    const { error } = updateOrganizationSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params
    const updates = req.body

    try {
      const oldResult = await pool.query(
        'SELECT * FROM organizations WHERE id = $1 AND delete_at IS NULL',
        [id],
      )
      if (oldResult.rows.length === 0) {
        return res.status(404).json({ error: 'Организация не найдена' })
      }

      const setClause = []
      const values = []
      let paramIndex = 1

      if (updates.name !== undefined) {
        setClause.push(`name = $${paramIndex++}`)
        values.push(updates.name)
      }
      if (updates.comment !== undefined) {
        setClause.push(`comment = $${paramIndex++}`)
        values.push(updates.comment)
      }
      setClause.push('update_at = CURRENT_TIMESTAMP')

      const query = `
        UPDATE organizations
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex} AND delete_at IS NULL
        RETURNING *
      `
      values.push(id)

      const updateResult = await pool.query(query, values)
      res.json(updateResult.rows[0])
    } catch (err) {
      next(err)
    }
  },

  deleteOrganization: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query(
        'UPDATE organizations SET delete_at = CURRENT_TIMESTAMP WHERE id = $1 AND delete_at IS NULL RETURNING *',
        [id],
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Организация не найдена' })
      }

      res.json({ message: 'Организация помечена как удалённая' })
    } catch (err) {
      next(err)
    }
  },
})
