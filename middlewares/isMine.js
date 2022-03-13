const jwt = require('jsonwebtoken')
// const config = require('../config')
const Project = require('../services/projects')
const { jwtSecret } = require('../config')

const isMyProject = async (req, res, next) => {
  const user = jwt.verify(req.cookies.token, jwtSecret)
  const project = await new Project().getByFilter({ _id: req.params.id })
  if (user.id === project.idBoss) return next()
  else {
    return res
      .status(403)
      .json({
        fail: true,
        status: 'Permisos insuficientes',
        err: 'Este proyecto no es tuyo.'
      })
  }
}

module.exports = { isMyProject }
