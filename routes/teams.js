const express = require('express')
const { isMyProject } = require('../middlewares/isMine')
const { isRegular } = require('../middlewares/auth')

const Team = require('../services/teams')
const teams = app => {
  const router = express.Router()
  const teamService = new Team()
  app.use('/teams', router)

  router.get('/', async (req, res) => {
    const teams = await teamService.getAll()
    return res.status(200).json(teams)
  })

  router.get('/:id', async (req, res) => {
    const team = await teamService.getById(req.params.id)
    return res.status(200).json(team)
  })

  router.get('/:id/project', async (req, res) => {
    const project = await teamService.GetByProjectId(req.params.id)
    return res.json(project)
  })

  router.post('/:projectid', [isRegular, isMyProject], async (req, res) => {
    const team = await teamService.create(req.params.projectid, req.body)

    team.fail
      ? res.status(400).json(team)
      : res.status(201).json(team)
  })
}

module.exports = teams
