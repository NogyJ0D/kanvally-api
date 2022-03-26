const express = require('express')
const { isRegular } = require('../middlewares/auth')
const { isMyProject, isInProject } = require('../middlewares/isMine')
const upload = require('../middlewares/upload')

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

  router.get('/:id/:userid/:filter', [isRegular, isInProject], async (req, res) => {
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

  router.post('/', [isRegular, upload.single('logo')], async (req, res) => {
    const project = await projectService.create(req.body, req.file)

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

  router.put('/invite/projectid/:id', [isRegular, isMyProject], async (req, res) => {
    const project = await projectService.invite(req.params.id, req.body)

    project.fail
      ? res.status(400).json(project)
      : res.status(200).json(project)
  })

  router.get('/confirm/:token', isRegular, async (req, res) => {
    const { token } = req.params
    const project = await projectService.confirmInvite(token)

    project.fail
      ? res.status(400).json(project)
      : res.status(200).json(project)
  })

  router.put('/expel/:id/:userId', [isRegular, isMyProject], async (req, res) => {
    const project = await projectService.expel(req.params.id, req.params.userId)

    project.fail
      ? res.status(400).json(project)
      : res.status(200).json(project)
  })

  router.delete('/:id', [isRegular, isMyProject], async (req, res) => {
    const project = await projectService.delete(req.params.id)

    project.fail
      ? res.status(400).json(project)
      : res.status(204).json(project)
  })
}

module.exports = projects
