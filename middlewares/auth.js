const jwt = require('jsonwebtoken')
const config = require('../config')

// 1
const isNew = (req, res, next) => {
  req.neededRole = 0
  verifyToken(req, res, next)
}

const isRegular = (req, res, next) => {
  req.neededRole = 1
  verifyToken(req, res, next)
}
const isAdmin = (req, res, next) => {
  req.neededRole = 2
  verifyToken(req, res, next)
}

// 2
const verifyToken = (req, res, next) => {
  const auth = req.header('Authorization')
  const tokenCookie = req.cookies.token

  if (!auth && !tokenCookie) {
    return res.status(403).json({
      fail: true,
      status: 'No-Auth',
      err: 'Se requiere un token para este proceso.'
    })
  }

  if (tokenCookie) handleToken(tokenCookie, req, res, next)
  else {
    const token = auth.split(' ')[1]
    handleToken(token, req, res, next)
  }
}
// 3
const handleToken = (token, req, res, next) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    req.user = decoded
    validateRole(req, res, next)
  } catch (err) {
    return res.status(403).json({
      fail: true,
      status: 'Expired',
      err: 'Se requiere un token válido para este proceso.'
    })
  }
}

// 4
const validateRole = (req, res, next) => {
  if (req.user.role >= req.neededRole) return next()
  else {
    return res.status(403).json({
      fail: true,
      status: 'Permisos insuficientes',
      err: 'Se requiere un token superior para este proceso.'
    })
  }
}

module.exports = { isNew, isRegular, isAdmin }
