const Joi = require('joi')

const OPERATION_TYPES = ['hiring', 'salary_change', 'department_change', 'dismissal']

const createOperationSchema = Joi.object({
  id_worker: Joi.number().integer().positive().required(),
  operation_type: Joi.string()
    .valid(...OPERATION_TYPES)
    .required(),
  id_department: Joi.number().integer().positive().allow(null),
  id_position: Joi.number().integer().positive().allow(null),
  salary: Joi.number().positive().allow(null),
}).custom((value, helpers) => {
  if (value.operation_type === 'hiring') {
    if (!value.id_department)
      return helpers.error('any.custom', { message: 'При принятии на работу отдел обязателен' })
    if (!value.id_position)
      return helpers.error('any.custom', {
        message: 'При принятии на работу должность обязательна',
      })
    if (!value.salary)
      return helpers.error('any.custom', { message: 'При принятии на работу зарплата обязательна' })
  }
  if (value.operation_type === 'salary_change' && !value.salary) {
    return helpers.error('any.custom', { message: 'При изменении зарплаты зарплата обязательна' })
  }
  if (value.operation_type === 'department_change' && !value.id_department) {
    return helpers.error('any.custom', { message: 'При изменении отдела отдел обязателен' })
  }
  return value
})

const updateOperationSchema = Joi.object({
  id_department: Joi.number().integer().positive().allow(null),
  id_position: Joi.number().integer().positive().allow(null),
  salary: Joi.number().positive().allow(null),
}).min(1)

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})

module.exports = (pool) => ({
  createOperation: async (req, res, next) => {
    const { error } = createOperationSchema.validate(req.body)
    if (error) {
      const message = error.details[0].context?.message || error.details[0].message
      return res.status(400).json({ error: message })
    }

    const { id_worker, operation_type, id_department, id_position, salary } = req.body

    try {
      const workerCheck = await pool.query(
        'SELECT id FROM workers WHERE id = $1 AND delete_at IS NULL',
        [id_worker],
      )
      if (workerCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Сотрудник не найден' })
      }

      if (id_department) {
        const deptCheck = await pool.query(
          'SELECT id FROM departments WHERE id = $1 AND delete_at IS NULL',
          [id_department],
        )
        if (deptCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Отдел не найден' })
        }
      }

      if (id_position) {
        const posCheck = await pool.query(
          'SELECT id FROM positions WHERE id = $1 AND delete_at IS NULL',
          [id_position],
        )
        if (posCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Должность не найдена' })
        }
      }

      const result = await pool.query(
        `INSERT INTO personnel_operations (id_worker, operation_type, id_department, id_position, salary)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id_worker, operation_type, id_department || null, id_position || null, salary || null],
      )

      res.status(201).json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },

  getOperations: async (req, res, next) => {
    try {
      const result = await pool.query(`
        SELECT po.*,
          w.surname || ' ' || w.name AS worker_name,
          d.name AS department_name,
          p.name AS position_name
        FROM personnel_operations po
        LEFT JOIN workers w ON po.id_worker = w.id
        LEFT JOIN departments d ON po.id_department = d.id
        LEFT JOIN positions p ON po.id_position = p.id
        WHERE po.delete_at IS NULL
        ORDER BY po.id DESC
      `)
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  getOperationById: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query(
        `SELECT po.*,
          w.surname || ' ' || w.name AS worker_name,
          d.name AS department_name,
          p.name AS position_name
        FROM personnel_operations po
        LEFT JOIN workers w ON po.id_worker = w.id
        LEFT JOIN departments d ON po.id_department = d.id
        LEFT JOIN positions p ON po.id_position = p.id
        WHERE po.id = $1 AND po.delete_at IS NULL`,
        [id],
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Кадровая операция не найдена' })
      }
      res.json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },

  updateOperation: async (req, res, next) => {
    const { error: idError } = idSchema.validate(req.params)
    if (idError) {
      return res.status(400).json({ error: idError.details[0].message })
    }

    const { error } = updateOperationSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params
    const updates = req.body

    try {
      const check = await pool.query(
        'SELECT * FROM personnel_operations WHERE id = $1 AND delete_at IS NULL',
        [id],
      )
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Кадровая операция не найдена' })
      }

      if (updates.id_department) {
        const deptCheck = await pool.query(
          'SELECT id FROM departments WHERE id = $1 AND delete_at IS NULL',
          [updates.id_department],
        )
        if (deptCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Отдел не найден' })
        }
      }
      if (updates.id_position) {
        const posCheck = await pool.query(
          'SELECT id FROM positions WHERE id = $1 AND delete_at IS NULL',
          [updates.id_position],
        )
        if (posCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Должность не найдена' })
        }
      }

      const setClause = []
      const values = []
      let paramIndex = 1

      const fields = ['id_department', 'id_position', 'salary']
      fields.forEach((field) => {
        if (updates[field] !== undefined) {
          setClause.push(`${field} = $${paramIndex++}`)
          values.push(updates[field])
        }
      })
      setClause.push('update_at = CURRENT_TIMESTAMP')
      values.push(id)

      const result = await pool.query(
        `UPDATE personnel_operations
         SET ${setClause.join(', ')}
         WHERE id = $${paramIndex} AND delete_at IS NULL
         RETURNING *`,
        values,
      )

      res.json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },

  deleteOperation: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query(
        'UPDATE personnel_operations SET delete_at = CURRENT_TIMESTAMP WHERE id = $1 AND delete_at IS NULL RETURNING *',
        [id],
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Кадровая операция не найдена' })
      }

      res.json({ message: 'Кадровая операция помечена как удалённая' })
    } catch (err) {
      next(err)
    }
  },
})
