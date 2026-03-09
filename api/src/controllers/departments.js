const Joi = require('joi')

const createDepartmentSchema = Joi.object({
  id_organization: Joi.number().integer().positive().required(),
  name: Joi.string().min(1).max(50).required(),
  id_parent: Joi.number().integer().positive().allow(null),
  comment: Joi.string().max(250).allow('', null),
})

const updateDepartmentSchema = Joi.object({
  id_organization: Joi.number().integer().positive(),
  name: Joi.string().min(1).max(50),
  id_parent: Joi.number().integer().positive().allow(null),
  comment: Joi.string().max(250).allow('', null),
}).min(1)

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})

module.exports = (pool) => ({
  createDepartment: async (req, res, next) => {
    const { error } = createDepartmentSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id_organization, name, id_parent, comment } = req.body

    try {
      const orgCheck = await pool.query(
        'SELECT id FROM organizations WHERE id = $1 AND delete_at IS NULL',
        [id_organization],
      )
      if (orgCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Указанная организация не найдена' })
      }

      if (id_parent) {
        const parentCheck = await pool.query(
          'SELECT id FROM departments WHERE id = $1 AND delete_at IS NULL',
          [id_parent],
        )
        if (parentCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Указанный родительский отдел не найден' })
        }
      }

      const result = await pool.query(
        `INSERT INTO departments (id_organization, name, id_parent, comment)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id_organization, name, id_parent || null, comment || ''],
      )

      res.status(201).json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },

  getDepartments: async (req, res, next) => {
    try {
      const result = await pool.query(`
        SELECT d.*, o.name AS organization_name
        FROM departments d
        LEFT JOIN organizations o ON d.id_organization = o.id
        WHERE d.delete_at IS NULL
        ORDER BY d.id
      `)
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  getDepartmentById: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query(
        `SELECT d.*, o.name AS organization_name
         FROM departments d
         LEFT JOIN organizations o ON d.id_organization = o.id
         WHERE d.id = $1 AND d.delete_at IS NULL`,
        [id],
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Отдел не найден' })
      }
      res.json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },

  updateDepartment: async (req, res, next) => {
    const { error: idError } = idSchema.validate(req.params)
    if (idError) {
      return res.status(400).json({ error: idError.details[0].message })
    }

    const { error } = updateDepartmentSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params
    const updates = req.body

    try {
      const oldResult = await pool.query(
        'SELECT * FROM departments WHERE id = $1 AND delete_at IS NULL',
        [id],
      )
      if (oldResult.rows.length === 0) {
        return res.status(404).json({ error: 'Отдел не найден' })
      }

      if (updates.id_organization) {
        const orgCheck = await pool.query(
          'SELECT id FROM organizations WHERE id = $1 AND delete_at IS NULL',
          [updates.id_organization],
        )
        if (orgCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Указанная организация не найдена' })
        }
      }

      if (updates.id_parent !== undefined && updates.id_parent !== null) {
        if (Number(updates.id_parent) === Number(id)) {
          return res.status(400).json({ error: 'Отдел не может быть родителем самого себя' })
        }
        const parentCheck = await pool.query(
          'SELECT id FROM departments WHERE id = $1 AND delete_at IS NULL',
          [updates.id_parent],
        )
        if (parentCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Указанный родительский отдел не найден' })
        }
      }

      const setClause = []
      const values = []
      let paramIndex = 1

      const fields = ['id_organization', 'name', 'id_parent', 'comment']
      fields.forEach((field) => {
        if (updates[field] !== undefined) {
          setClause.push(`${field} = $${paramIndex++}`)
          values.push(updates[field])
        }
      })
      setClause.push('update_at = CURRENT_TIMESTAMP')

      const query = `
        UPDATE departments
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

  deleteDepartment: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query(
        'UPDATE departments SET delete_at = CURRENT_TIMESTAMP WHERE id = $1 AND delete_at IS NULL RETURNING *',
        [id],
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Отдел не найден' })
      }

      res.json({ message: 'Отдел помечен как удалённый' })
    } catch (err) {
      next(err)
    }
  },
})
