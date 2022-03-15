const express = require('express')
const { isRegular } = require('../middlewares/auth')
const { isMyProject } = require('../middlewares/isMine')

const Project = require('../services/projects')
const projects = app => {
  const router = express.Router()
  const projectService = new Project()
  app.use('/projects', router)

  // TODO: ver si necesito el isAdmin
  router.get('/', async (req, res) => {
    const projects = await projectService.getAll()
    return res.status(200).json(projects)
  })

  // router.get('/:id/all', async (req, res) => {
  //   const project = await projectService.getAllById(req.params.id)
  //   return res.json(project)
  // })

  // router.get('/:id/members/', async (req, res) => {
  //   const members = await projectService.getMembersByProject(req.params.id)
  //   return res.status(200).json(members)
  // })

  router.get('/:id/:filter', [isRegular, isMyProject], async (req, res) => {
    const { id, filter } = req.params
    let response
    if (filter === 'normal') response = await projectService.getProject(id)
    else if (filter === 'members') response = await projectService.getProjectMembers(id)
    else if (filter === 'teams') response = await projectService.getProjectTeams(id)
    else if (filter === 'all') response = await projectService.getProjectComplete(id)
    else response = { fail: true, error: 'Debe ingresar un filtro (normal - members - teams - all).' }

    response.fail
      ? res.status(400).json(response)
      : res.status(200).json(response)
  })

  router.post('/', isRegular, async (req, res) => {
    const project = await projectService.create(req.body)

    project.fail
      ? res.status(400).json(project)
      : res.status(201).json(project)
  })

  router.put('/:id', [isRegular, isMyProject], async (req, res) => {
    const project = await projectService.update(req.params.id, req.body)

    project.fail
      ? res.status(400).json(project)
      : res.status(200).json(project)
  })

  router.put('/invite/:id', [isRegular, isMyProject], async (req, res) => {
    const project = await projectService.invite(req.params.id, req.body)

    project.fail
      ? res.status(400).json(project)
      : res.status(200).json(project)
  })

  router.delete('/:id', [isRegular, isMyProject], async (req, res) => {
    const project = await projectService.delete(req.params.id)

    project.fail
      ? res.status(400).json(project)
      : res.status(200).json(project)
  })
}

module.exports = projects
