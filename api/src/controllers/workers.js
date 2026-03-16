const Joi = require('joi')

const passportSchema = Joi.object({
  series: Joi.string().min(1).max(20).required(),
  number: Joi.string().min(1).max(20).required(),
  date_issue: Joi.date().required(),
  unit_kod: Joi.string().min(1).max(20).required(),
  issued_by_whom: Joi.string().min(1).max(250).required(),
})

const addressSchema = Joi.object({
  region: Joi.string().min(1).max(100).required(),
  locality: Joi.string().min(1).max(100).required(),
  street: Joi.string().min(1).max(100).required(),
  house: Joi.string().min(1).max(100).required(),
  building: Joi.string().max(100).allow('', null),
  apartment: Joi.string().max(10).allow('', null),
})

const createWorkerSchema = Joi.object({
  surname: Joi.string().min(1).max(50).required(),
  name: Joi.string().min(1).max(50).required(),
  patronymic: Joi.string().max(50).allow('', null),
  date_of_birth: Joi.date().required(),
  passport: passportSchema.required(),
  address: addressSchema.required(),
})

const updateWorkerSchema = Joi.object({
  surname: Joi.string().min(1).max(50),
  name: Joi.string().min(1).max(50),
  patronymic: Joi.string().max(50).allow('', null),
  date_of_birth: Joi.date(),
  passport: passportSchema,
  address: addressSchema,
}).min(1)

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})

module.exports = (pool) => ({
  createWorker: async (req, res, next) => {
    const { error } = createWorkerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { surname, name, patronymic, date_of_birth, passport, address } = req.body
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      const passportResult = await client.query(
        `INSERT INTO passports (series, number, date_issue, unit_kod, issued_by_whom)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          passport.series,
          passport.number,
          passport.date_issue,
          passport.unit_kod,
          passport.issued_by_whom,
        ],
      )
      const newPassport = passportResult.rows[0]

      const addressResult = await client.query(
        `INSERT INTO address (region, locality, street, house, building, apartment)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          address.region,
          address.locality,
          address.street,
          address.house,
          address.building || '',
          address.apartment || '',
        ],
      )
      const newAddress = addressResult.rows[0]

      const workerResult = await client.query(
        `INSERT INTO workers (surname, name, patronymic, date_of_birth, id_passport, id_address)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [surname, name, patronymic || null, date_of_birth, newPassport.id, newAddress.id],
      )

      await client.query('COMMIT')

      res.status(201).json({
        ...workerResult.rows[0],
        passport: newPassport,
        address: newAddress,
      })
    } catch (err) {
      await client.query('ROLLBACK')
      next(err)
    } finally {
      client.release()
    }
  },

  getWorkers: async (req, res, next) => {
    try {
      const result = await pool.query(`
        SELECT w.*, 
          p.series AS passport_series, p.number AS passport_number,
          p.date_issue AS passport_date_issue, p.unit_kod AS passport_unit_kod,
          p.issued_by_whom AS passport_issued_by_whom,
          a.region, a.locality, a.street, a.house, a.building, a.apartment
        FROM workers w
        LEFT JOIN passports p ON w.id_passport = p.id
        LEFT JOIN address a ON w.id_address = a.id
        WHERE w.delete_at IS NULL
        ORDER BY w.id
      `)
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  getWorkerById: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const workerResult = await pool.query(
        'SELECT * FROM workers WHERE id = $1 AND delete_at IS NULL',
        [id],
      )
      if (workerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Сотрудник не найден' })
      }
      const worker = workerResult.rows[0]

      const passportResult = await pool.query('SELECT * FROM passports WHERE id = $1', [
        worker.id_passport,
      ])
      const addressResult = await pool.query('SELECT * FROM address WHERE id = $1', [
        worker.id_address,
      ])

      const filesResult = await pool.query(
        'SELECT * FROM files WHERE id_worker = $1 AND delete_at IS NULL ORDER BY id',
        [id],
      )

      res.json({
        ...worker,
        passport: passportResult.rows[0] || null,
        address: addressResult.rows[0] || null,
        files: filesResult.rows,
      })
    } catch (err) {
      next(err)
    }
  },

  updateWorker: async (req, res, next) => {
    const { error: idError } = idSchema.validate(req.params)
    if (idError) {
      return res.status(400).json({ error: idError.details[0].message })
    }

    const { error } = updateWorkerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params
    const updates = req.body
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      const workerCheck = await client.query(
        'SELECT * FROM workers WHERE id = $1 AND delete_at IS NULL',
        [id],
      )
      if (workerCheck.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(404).json({ error: 'Сотрудник не найден' })
      }
      const worker = workerCheck.rows[0]

      if (updates.passport) {
        const p = updates.passport
        await client.query(
          `UPDATE passports SET series = $1, number = $2, date_issue = $3,
           unit_kod = $4, issued_by_whom = $5, update_at = CURRENT_TIMESTAMP
           WHERE id = $6`,
          [p.series, p.number, p.date_issue, p.unit_kod, p.issued_by_whom, worker.id_passport],
        )
      }

      if (updates.address) {
        const a = updates.address
        await client.query(
          `UPDATE address SET region = $1, locality = $2, street = $3,
           house = $4, building = $5, apartment = $6, update_at = CURRENT_TIMESTAMP
           WHERE id = $7`,
          [
            a.region,
            a.locality,
            a.street,
            a.house,
            a.building || '',
            a.apartment || '',
            worker.id_address,
          ],
        )
      }

      const setClause = []
      const values = []
      let paramIndex = 1

      const fields = ['surname', 'name', 'patronymic', 'date_of_birth']
      fields.forEach((field) => {
        if (updates[field] !== undefined) {
          setClause.push(`${field} = $${paramIndex++}`)
          values.push(updates[field])
        }
      })

      if (setClause.length > 0) {
        setClause.push('update_at = CURRENT_TIMESTAMP')
        values.push(id)
        await client.query(
          `UPDATE workers SET ${setClause.join(', ')} WHERE id = $${paramIndex} AND delete_at IS NULL`,
          values,
        )
      }

      await client.query('COMMIT')

      const updatedWorker = await pool.query('SELECT * FROM workers WHERE id = $1', [id])
      const updatedPassport = await pool.query('SELECT * FROM passports WHERE id = $1', [
        worker.id_passport,
      ])
      const updatedAddress = await pool.query('SELECT * FROM address WHERE id = $1', [
        worker.id_address,
      ])

      res.json({
        ...updatedWorker.rows[0],
        passport: updatedPassport.rows[0],
        address: updatedAddress.rows[0],
      })
    } catch (err) {
      await client.query('ROLLBACK')
      next(err)
    } finally {
      client.release()
    }
  },

  deleteWorker: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query(
        'UPDATE workers SET delete_at = CURRENT_TIMESTAMP WHERE id = $1 AND delete_at IS NULL RETURNING *',
        [id],
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Сотрудник не найден' })
      }

      res.json({ message: 'Сотрудник помечен как удалённый' })
    } catch (err) {
      next(err)
    }
  },
})
