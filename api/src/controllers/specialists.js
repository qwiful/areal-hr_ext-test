const Joi = require('joi')
const argon2 = require('argon2')

const createSpecialistSchema = Joi.object({
  surname: Joi.string().min(1).max(50).required(),
  name: Joi.string().min(1).max(50).required(),
  patronymic: Joi.string().max(50).allow('', null),
  login: Joi.string().min(3).max(20).required(),
  password: Joi.string().min(6).max(100).required(),
  id_role: Joi.number().integer().positive().required(),
})

const updateSpecialistSchema = Joi.object({
  surname: Joi.string().min(1).max(50),
  name: Joi.string().min(1).max(50),
  patronymic: Joi.string().max(50).allow('', null),
  login: Joi.string().min(3).max(20),
  password: Joi.string().min(6).max(100),
  id_role: Joi.number().integer().positive(),
}).min(1)

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})

module.exports = (pool) => ({
  createSpecialist: async (req, res, next) => {
    const { error } = createSpecialistSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { surname, name, patronymic, login, password, id_role } = req.body
    const client = await pool.connect()

    try {
      const loginCheck = await client.query(
        'SELECT id FROM "authorization" WHERE login = $1 AND delete_at IS NULL',
        [login],
      )
      if (loginCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Пользователь с таким логином уже существует' })
      }

      const roleCheck = await client.query('SELECT id FROM role WHERE id = $1', [id_role])
      if (roleCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Указанная роль не найдена' })
      }

      await client.query('BEGIN')

      const hashedPassword = await argon2.hash(password, { type: argon2.argon2id })

      const authResult = await client.query(
        `INSERT INTO "authorization" (login, password)
         VALUES ($1, $2)
         RETURNING *`,
        [login, hashedPassword],
      )
      const newAuth = authResult.rows[0]

      const specialistResult = await client.query(
        `INSERT INTO specialist (surname, name, patronymic, id_authorization, id_role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [surname, name, patronymic || null, newAuth.id, id_role],
      )

      await client.query('COMMIT')

      const specialist = specialistResult.rows[0]
      res.status(201).json({
        ...specialist,
        login: newAuth.login,
      })
    } catch (err) {
      await client.query('ROLLBACK')
      next(err)
    } finally {
      client.release()
    }
  },

  getSpecialists: async (req, res, next) => {
    try {
      const result = await pool.query(`
        SELECT s.id, s.surname, s.name, s.patronymic,
          s.id_role, r.role AS role_name,
          a.login,
          s.add_at, s.update_at, s.delete_at
        FROM specialist s
        LEFT JOIN "authorization" a ON s.id_authorization = a.id
        LEFT JOIN role r ON s.id_role = r.id
        WHERE s.delete_at IS NULL
        ORDER BY s.id
      `)
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  getSpecialistById: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      const result = await pool.query(
        `SELECT s.id, s.surname, s.name, s.patronymic,
          s.id_role, r.role AS role_name,
          a.login,
          s.add_at, s.update_at, s.delete_at
        FROM specialist s
        LEFT JOIN "authorization" a ON s.id_authorization = a.id
        LEFT JOIN role r ON s.id_role = r.id
        WHERE s.id = $1 AND s.delete_at IS NULL`,
        [id],
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }
      res.json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },

  updateSpecialist: async (req, res, next) => {
    const { error: idError } = idSchema.validate(req.params)
    if (idError) {
      return res.status(400).json({ error: idError.details[0].message })
    }

    const { error } = updateSpecialistSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params
    const updates = req.body
    const client = await pool.connect()

    try {
      const specialistCheck = await client.query(
        'SELECT * FROM specialist WHERE id = $1 AND delete_at IS NULL',
        [id],
      )
      if (specialistCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }
      const specialist = specialistCheck.rows[0]

      await client.query('BEGIN')

      if (updates.login || updates.password) {
        const authSetClause = []
        const authValues = []
        let authParamIndex = 1

        if (updates.login) {
          const loginCheck = await client.query(
            'SELECT id FROM "authorization" WHERE login = $1 AND id != $2 AND delete_at IS NULL',
            [updates.login, specialist.id_authorization],
          )
          if (loginCheck.rows.length > 0) {
            await client.query('ROLLBACK')
            return res.status(400).json({ error: 'Логин уже занят другим пользователем' })
          }
          authSetClause.push(`login = $${authParamIndex++}`)
          authValues.push(updates.login)
        }

        if (updates.password) {
          const hashedPassword = await argon2.hash(updates.password, { type: argon2.argon2id })
          authSetClause.push(`password = $${authParamIndex++}`)
          authValues.push(hashedPassword)
        }

        authSetClause.push('update_at = CURRENT_TIMESTAMP')
        authValues.push(specialist.id_authorization)

        await client.query(
          `UPDATE "authorization" SET ${authSetClause.join(', ')} WHERE id = $${authParamIndex}`,
          authValues,
        )
      }

      const specSetClause = []
      const specValues = []
      let specParamIndex = 1

      const specFields = ['surname', 'name', 'patronymic', 'id_role']
      specFields.forEach((field) => {
        if (updates[field] !== undefined) {
          specSetClause.push(`${field} = $${specParamIndex++}`)
          specValues.push(updates[field])
        }
      })

      if (specSetClause.length > 0) {
        if (updates.id_role) {
          const roleCheck = await client.query('SELECT id FROM role WHERE id = $1', [
            updates.id_role,
          ])
          if (roleCheck.rows.length === 0) {
            await client.query('ROLLBACK')
            return res.status(400).json({ error: 'Указанная роль не найдена' })
          }
        }

        specSetClause.push('update_at = CURRENT_TIMESTAMP')
        specValues.push(id)

        await client.query(
          `UPDATE specialist SET ${specSetClause.join(', ')} WHERE id = $${specParamIndex} AND delete_at IS NULL`,
          specValues,
        )
      }

      await client.query('COMMIT')

      const updatedResult = await pool.query(
        `SELECT s.id, s.surname, s.name, s.patronymic,
          s.id_role, r.role AS role_name,
          a.login,
          s.add_at, s.update_at
        FROM specialist s
        LEFT JOIN "authorization" a ON s.id_authorization = a.id
        LEFT JOIN role r ON s.id_role = r.id
        WHERE s.id = $1`,
        [id],
      )

      res.json(updatedResult.rows[0])
    } catch (err) {
      await client.query('ROLLBACK')
      next(err)
    } finally {
      client.release()
    }
  },

  deleteSpecialist: async (req, res, next) => {
    const { error } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { id } = req.params

    try {
      if (Number(id) === req.user?.id) {
        return res.status(400).json({ error: 'Нельзя удалить самого себя' })
      }

      const specialistCheck = await pool.query(
        'SELECT * FROM specialist WHERE id = $1 AND delete_at IS NULL',
        [id],
      )
      if (specialistCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }

      const specialist = specialistCheck.rows[0]

      await pool.query('UPDATE specialist SET delete_at = CURRENT_TIMESTAMP WHERE id = $1', [id])
      await pool.query('UPDATE "authorization" SET delete_at = CURRENT_TIMESTAMP WHERE id = $1', [
        specialist.id_authorization,
      ])

      res.json({ message: 'Пользователь помечен как удалённый' })
    } catch (err) {
      next(err)
    }
  },

  getRoles: async (req, res, next) => {
    try {
      const result = await pool.query('SELECT * FROM role ORDER BY id')
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },
})
