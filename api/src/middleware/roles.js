function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }
    if (req.user.role_name === requiredRole) {
      return next()
    }
    res.status(403).json({ error: 'Недостаточно прав' })
  }
}

module.exports = requireRole
