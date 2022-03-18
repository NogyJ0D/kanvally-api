const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config')
const TeamModel = require('../models/team')

const canChangeState = (req, res, next) => {
  console.log('canChangeState')
  const { id } = jwt.verify(req.cookies.token, jwtSecret)

  return TeamModel.findOne({ _id: req.body.idTeam }, 'members')
    .then(result => {
      const member = result.members.filter(member => member._id.toString() === id)
      console.log(member)
      if (
        (member[0].role === 'Miembro' && req.body.state <= 4) ||
        (member[0].role === 'Tester' && req.body.state === 5) ||
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

module.exports = { canChangeState }
