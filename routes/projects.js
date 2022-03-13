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

  router.delete('/:id', [isRegular, isMyProject], async (req, res) => {
    const project = await projectService.delete(req.params.id)

    project.fail
      ? res.status(400).json(project)
      : res.status(200).json(project)
  })
}

module.exports = projects
