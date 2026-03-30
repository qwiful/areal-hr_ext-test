const passport = require('passport')

module.exports = {
  login: (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err)
      if (!user) {
        return res.status(401).json({ error: info?.message || 'Ошибка аутентификации' })
      }
      req.logIn(user, (err) => {
        if (err) return next(err)
        res.json({
          user: {
            id: user.id,
            login: user.login,
            surname: user.surname,
            name: user.name,
            patronymic: user.patronymic,
            role_name: user.role_name,
          },
        })
      })
    })(req, res, next)
  },

  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err)
      req.session.destroy((err) => {
        if (err) return next(err)
        res.clearCookie('connect.sid')
        res.json({ message: 'Вы вышли из системы' })
      })
    })
  },

  getMe: (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user })
    } else {
      res.status(401).json({ error: 'Не авторизован' })
    }
  },
}
