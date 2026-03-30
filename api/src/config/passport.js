const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const argon2 = require('argon2')
const pool = require('../db')

passport.use(
  new LocalStrategy(
    {
      usernameField: 'login',
      passwordField: 'password',
    },
    async (login, password, done) => {
      try {
        const result = await pool.query(
          'SELECT * FROM "authorization" WHERE login = $1 AND delete_at IS NULL',
          [login],
        )

        const user = result.rows[0]
        if (!user) {
          return done(null, false, { message: 'Неверный логин или пароль' })
        }

        const isValid = await argon2.verify(user.password, password)
        if (!isValid) {
          return done(null, false, { message: 'Неверный логин или пароль' })
        }

        const specialistResult = await pool.query(
          'SELECT s.*, r.role as role_name FROM "specialist" s JOIN "role" r ON s.id_role = r.id WHERE s.id_authorization = $1 AND s.delete_at IS NULL',
          [user.id],
        )

        const specialist = specialistResult.rows[0]
        if (!specialist) {
          return done(null, false, { message: 'Специалист не найден' })
        }

        return done(null, {
          id: specialist.id,
          login: user.login,
          surname: specialist.surname,
          name: specialist.name,
          patronymic: specialist.patronymic,
          role_name: specialist.role_name,
          role_id: specialist.id_role,
        })
      } catch (err) {
        console.error('Passport error:', err)
        return done(err)
      }
    },
  ),
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.surname, s.name, s.patronymic, s.id_role,
        r.role AS role_name, a.login
      FROM specialist s
      JOIN "authorization" a ON s.id_authorization = a.id
      JOIN role r ON s.id_role = r.id
      WHERE s.id = $1 AND s.delete_at IS NULL AND a.delete_at IS NULL`,
      [id],
    )

    const row = result.rows[0]
    if (!row) {
      return done(null, false)
    }

    done(null, {
      id: row.id,
      login: row.login,
      surname: row.surname,
      name: row.name,
      patronymic: row.patronymic,
      role_name: row.role_name,
      role_id: row.id_role,
    })
  } catch (err) {
    console.error('Deserialize error:', err)
    done(err)
  }
})

module.exports = passport
