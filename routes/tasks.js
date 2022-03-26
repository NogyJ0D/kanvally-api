const express = require('express')
const { isRegular } = require('../middlewares/auth')
const { isMyTeam } = require('../middlewares/isMine')
const { canChangeState, isMember } = require('../middlewares/teams')

const Task = require('../services/tasks')
const tasks = app => {
  const router = express.Router()
  const taskService = new Task()
  app.use('/tasks', router)

  router.get('/', isRegular, async (req, res) => {
    const tasks = await taskService.getAll()

    tasks.fail
      ? res.status(400).json(tasks)
      : res.status(200).json(tasks)
  })

  router.post('/', isRegular, async (req, res) => {
    const task = await taskService.create(req.body)

    task.fail
      ? res.status(400).json(task)
      : res.status(201).json(task)
  })

  router.put('/state/team/:idTeam/task/:idTask', [isRegular, isMember, canChangeState], async (req, res) => {
    const task = await taskService.changeState(req.params.idTask, req.body)

    task.fail
      ? res.status(400).json(task)
      : res.status(200).json(task)
  })

  router.put('/comment/team/:idTeam/option/:option/idTask/:idTask', [isRegular, isMember], async (req, res) => {
    const { option, idTask } = req.params
    let comment

    if (option === 'add') comment = await taskService.addComment(idTask, req.body)
    else if (option === 'delete') comment = await taskService.deleteComment(idTask, req.body)
    else return res.status(400).json({ fail: true, error: 'Debe ingresar una opción (add - delete).' })

    comment.fail
      ? res.status(400).json(comment)
      : res.status(200).json(comment)
  })

  router.delete('/:id/:taskid', [isRegular, isMyTeam], async (req, res) => {
    const task = await taskService.delete(req.params.id, req.params.taskid)

    task.fail
      ? res.status(400).json(task)
      : res.status(204).json(task)
  })
}

module.exports = tasks
