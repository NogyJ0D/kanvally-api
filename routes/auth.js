const express = require('express')
const tokenCookie = require('../helpers/tokenCookie')
const { isNew } = require('../middlewares/auth')

const Auth = require('../services/auth')
const auth = app => {
  const router = express.Router()
  const authService = new Auth()
  app.use('/auth', router)

  router.post('/login', async (req, res) => {
    const { email, password } = req.body
    const response = await authService.login(email, password)

    if (response.fail) return res.status(400).json(response)
    else return tokenCookie(res, response)
  })

  router.post('/validate', isNew, (req, res) => {
    return res.json(req.user)
  })

  router.post('/logout', (req, res) => {
    return res.cookie('token', '', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      expires: new Date()
    }).json({ loggedOut: true })
  })

  router.post('/signup', async (req, res) => {
    const response = await authService.signup(req.body)

    if (response.fail || response.errors) return res.status(400).json(response)
    else return res.status(201).json(response)
  })

  router.get('/email/:token', async (req, res) => {
    const { token } = req.params
    const response = await authService.emailValidate(token)

    if (response.fail) return res.status(400).json(response)
    return res.status(200).send('<h1>Tu email se validó exitosamente.</h1>')
  })
}

module.exports = auth
