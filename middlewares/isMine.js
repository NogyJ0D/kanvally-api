const jwt = require('jsonwebtoken')
const Project = require('../services/projects')
const Team = require('../services/teams')
const { jwtSecret } = require('../config')

const isMyProject = async (req, res, next) => {
  try {
    const user = jwt.verify(req.cookies.token, jwtSecret)
    const project = await new Project().getProject(req.params.id)

    if ((user.id === project.idBoss.toString()) || user.role === 2) return next()
    else {
      return res.status(403).json({
        fail: true,
        status: 'Permisos insuficientes',
        error: 'Este proyecto no es tuyo.'
      })
    }
  } catch (error) {
    return res.status(404).json({ fail: true, error: 'El proyecto no existe.' })
  }
}

const isMyTeam = async (req, res, next) => {
  try {
    const user = jwt.verify(req.cookies.token, jwtSecret)
    const team = await new Team().getById(req.params.id)
    const project = await new Project().getProject(team.idProject)

    if ((user.id === team.idLeader.toString()) || (user.id === project.idBoss)) return next()
    else {
      return res.status(403).json({
        fail: true,
        status: 'Permisos insuficientes',
        error: 'No eres el líder de este proyecto.'
      })
    }
  } catch (error) {
    return res.status(404).json({ fail: true, error: 'El equipo no existe.' })
  }
}

module.exports = { isMyProject, isMyTeam }
