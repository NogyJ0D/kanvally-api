const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config')
const projectModel = require('../models/project')
const Project = require('../services/projects')
const Team = require('../services/teams')

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

const isInProject = (req, res, next) => {
  return projectModel.findOne({ _id: req.params.id, 'members._id': req.params.userid })
    .then(res => { return next() })
    .catch(() => { return res.status(404).json(({ fail: true, err: 'No existe un proyecto con esos parámetros.' })) })
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

const isMember = async (req, res, next) => {
  try {
    const user = jwt.verify(req.cookies.token, jwtSecret)
    const team = await new Team().getById(req.body.idTeam)

    if (team.fail) throw Error
    else if (team.members.filter(member => member._id.toString() === user.id).length > 0) return next()
    else return res.status(403).json({ fail: true, error: 'El usuario no es parte del equipo.' })
  } catch (err) { return res.status(404).json({ fail: true, error: 'El equipo no existe.' }) }
}

module.exports = { isMyProject, isMyTeam, isInProject, isMember }
