const { env } = require('../config')

const tokenCookie = (res, data) => {
  const date = new Date(new Date().setDate(new Date().getDate() + 7))
  return res.cookie('token', data.token, {
    httpOnly: true,
    sameSite: 'none',
    secure: env !== 'dev',
    expires: date
  }).json(data.data)
}

module.exports = tokenCookie
