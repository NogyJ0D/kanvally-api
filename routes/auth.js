const express = require('express')
const passport = require('passport')
const tokenCookie = require('../helpers/tokenCookie')
const { useGoogleStrategy, useSpotifyStrategy, isNew } = require('../middlewares/auth')

const Auth = require('../services/auth')
const auth = app => {
  const router = express.Router()
  const authService = new Auth()
  app.use('/auth', router)

  app.use(passport.initialize())
  passport.use(useGoogleStrategy())
  passport.use(useSpotifyStrategy())
  passport.serializeUser((user, done) => {
    done(null, user)
  })

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
    const user = req.body
    const response = await authService.signup(user)

    if (response.fail || response.errors) return res.json(response)
    else return tokenCookie(res, response)
  })

  router.get('/email/:token', async (req, res) => {
    const { token } = req.params
    const response = await authService.emailValidate(token)

    if (response.fail) return res.status(400).json(response)
    return res.status(200).json({ success: true, message: 'Tu email se validó exitosamente.' })
  })

  router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }))
  router.get('/google/callback', passport.authenticate('google'), async (req, res) => {
    const profile = {
      username: req.user.profile.displayName,
      firstname: req.user.profile.name.givenName,
      lastname: req.user.profile.name.familyName,
      email: req.user.profile.emails[0].value || null,
      role: 1,
      profile_pic: req.user.profile.photos[0].value || null,
      provider: req.user.profile.provider,
      idProvider: req.user.profile.id
    }
    const response = await authService.loginProvider(profile)
    return tokenCookie(res, response)
  })

  router.get('/spotify', passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-private'], showDialog: true }))
  router.get('/spotify/callback', passport.authenticate('spotify'), async (req, res) => {
    const profile = {
      username: req.user.profile.username,
      firstname: null,
      lastname: null,
      email: req.user.profile.emails[0].value || null,
      role: 0,
      profile_pic: req.user.profile.photos[0].value || null,
      provider: req.user.profile.provider,
      idProvider: req.user.profile.id
    }
    const response = await authService.loginProvider(profile)
    return tokenCookie(res, response)
  })
}

module.exports = auth
