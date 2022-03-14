const jwt = require('jsonwebtoken')
// const config = require('../config')
const Project = require('../services/projects')
const { jwtSecret } = require('../config')

const isMyProject = async (req, res, next) => {
  try {
    const user = jwt.verify(req.cookies.token, jwtSecret)
    const project = await new Project().getByFilter({ _id: req.params.id })

    if (!project) return res.status(404).json({ fail: true, err: 'El proyecto no existe.' })
    if (user.id === project.idBoss.toString()) return next()
    else {
      return res.status(403).json({
        fail: true,
        status: 'Permisos insuficientes',
        err: 'Este proyecto no es tuyo.'
      })
    }
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ fail: true, err: 'El proyecto no existe.' })
    return error
  }
}

module.exports = { isMyProject }
