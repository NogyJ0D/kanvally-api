const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config')
const TeamModel = require('../models/team')

const isMember = async (req, res, next) => {
  try {
    const user = jwt.verify(req.cookies.token, jwtSecret)
    const team = await TeamModel.findOne({ _id: req.params.idTeam })

    if (!team) return res.status(404).json({ fail: true, error: 'El equipo no existe.' })
    else if (team.members.some(member => member._id.toString() === user.id)) return next()
    else return res.status(403).json({ fail: true, error: 'El usuario no es parte del equipo.' })
  } catch (err) {
    return res.status(403).json({
      fail: true,
      status: 'Token-Expirado',
      err: 'Se requiere un token válido para este proceso.'
    })
  }
}

const canChangeState = (req, res, next) => {
  const { id } = jwt.verify(req.cookies.token, jwtSecret)

  return TeamModel.findOne({ _id: req.params.idTeam }, 'members')
    .then(result => {
      const member = result.members.filter(member => member._id.toString() === id)
      if (
        (member[0].role === 'Miembro' && req.body.state <= 4) ||
        (member[0].role === 'Tester' && req.body.state <= 5) ||
        (member[0].role === 'Líder')) return next()
      else {
        return res.status(403).json({
          fail: true,
          status: 'Permisos insuficientes',
          err: 'Se requiere un rol superior para este proceso.'
        })
      }
    })
}

module.exports = { isMember, canChangeState }
