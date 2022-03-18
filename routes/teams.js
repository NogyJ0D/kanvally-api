const express = require('express')
const { isMyProject, isMyTeam } = require('../middlewares/isMine')
const { isRegular } = require('../middlewares/auth')

const Team = require('../services/teams')
const teams = app => {
  const router = express.Router()
  const teamService = new Team()
  app.use('/teams', router)

  router.get('/', async (req, res) => {
    const teams = await teamService.getAll()

    teams.fail
      ? res.status(404).json(teams)
      : res.status(200).json(teams)
  })

  router.get('/:id/:filter', isRegular, async (req, res) => {
    const { id, filter } = req.params
    let response

    if (filter === 'team') response = await teamService.getById(id)
    else if (filter === 'project') response = await teamService.GetByProject(id)
    else response = { fail: true, error: 'Debe ingresar un filtro (team - project).' }

    response.fail
      ? res.status(400).json(response)
      : res.status(200).json(response)
  })

  router.post('/:id', [isRegular, isMyProject], async (req, res) => {
    const team = await teamService.create(req.params.id, req.body)

    team.fail
      ? res.status(400).json(team)
      : res.status(201).json(team)
  })

  router.put('/edit/:id/', [isRegular, isMyTeam], async (req, res) => {
    const team = await teamService.update(req.params.id, req.body)

    team.fail
      ? res.status(400).json(team)
      : res.status(200).json(team)
  })

  router.put('/role/:id/', [isRegular, isMyTeam], async (req, res) => {
    const team = await teamService.changeRole(req.params.id, req.body)

    team.fail
      ? res.status(400).json(team)
      : res.status(200).json(team)
  })

  router.put('/invite/:id/', [isRegular, isMyTeam], async (req, res) => {
    const team = await teamService.addUser(req.params.id, req.body)

    team.fail
      ? res.status(400).json(team)
      : res.status(200).json(team)
  })

  router.put('/expel/:id/:userid', [isRegular, isMyTeam], async (req, res) => {
    const team = await teamService.expelUser(req.params.id, req.params.userid)

    team.fail
      ? res.status(400).json(team)
      : res.status(200).json(team)
  })

  router.delete('/:id', [isRegular, isMyTeam], async (req, res) => {
    const team = await teamService.delete(req.params.id)

    team.fail
      ? res.status(400).json(team)
      : res.status(200).json(team)
  })
}

module.exports = teams
