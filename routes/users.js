const express = require('express')
const { isRegular } = require('../middlewares/auth')

const User = require('../services/users')
const users = app => {
  const router = express.Router()
  const userService = new User()
  app.use('/users', router)

  router.get('/', async (req, res) => {
    const users = await userService.getAll()

    return res.status(200).json(users)
  })

  router.get('/:id/:filter', async (req, res) => {
    const { id, filter } = req.params
    let response

    if (filter === 'normal') response = await userService.getById(id)
    else if (filter === 'projects') response = await userService.getProjects(id)
    else response = { fail: true, error: 'Debe ingresar un filtro (normal).' }

    response.fail
      ? res.status(400).json(response)
      : res.status(200).json(response)
  })
}

module.exports = users
