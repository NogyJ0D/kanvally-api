const TaskModel = require('../models/task')
const TeamModel = require('../models/team')

class Tasks {
  validate (error) {
    console.log(error)
    const errorMessages = Object.keys(error.errors).map(e => {
      const err = error.errors[e]
      // if (err.kind === 'unique') return 'Ya existe un equipo en tu proyecto con ese nombre, intente otro.'
      return err.message
    })
    return { fail: true, errorMessages }
  }

  async getAll () {
    return await TaskModel.find()
      .then(res => {
        if (res.length === 0) return { fail: true, error: 'No hay tareas' }
        else return res
      })
  }

  async create (data) {
    data.comments = []
    const team = await TeamModel.findOne({ _id: data.idTeam, 'members._id': data.authorId, idProject: data.idProject })
    if (!team) return { fail: true, error: 'No existe un equipo con esos parámetros.' }

    const task = await new TaskModel(data).save()
    return TeamModel.findOneAndUpdate({ _id: data.idTeam }, { $push: { [`tasks.${data.state}`]: { _id: task._id } } }, { new: true })
      .then(res => { return res.tasks })
      .catch(error => { return this.validate(error) })
  }

  async changeState (idTask, idTeam, data) {
    const task = await TaskModel.findOneAndUpdate({ _id: idTask, idTeam }, { state: data.state }, { runValidators: true })
    if (!task) return { fail: true, err: 'Esa tarea no existe' }

    await TeamModel.findOneAndUpdate({ _id: idTeam }, { $pull: { [`tasks.${task.state}`]: { _id: idTask } } })
    return TeamModel.findOneAndUpdate({ _id: idTeam }, { $push: { [`tasks.${data.state}`]: { _id: idTask } } }, { new: true })
      .then(res => { return res.tasks })
      .catch(error => { return this.validate(error) })
  }

  async delete (id, taskId) {
    return TaskModel.findByIdAndDelete(taskId)
      .then(res => {
        return TeamModel.findByIdAndUpdate(id, { $pull: { tasks: taskId } })
          .then(res => { return { success: true, message: 'La tarea fue eliminada con éxito.' } })
          .catch(error => { return this.validate(error) })
      })
      .catch(error => { return this.validate(error) })
  }

  async addComment (id, data) {
    return TaskModel.findByIdAndUpdate(id, { $push: { comments: { username: data.username, text: data.text } } }, { runValidators: true, new: true })
      .then(res => {
        return res.comments
      })
      .catch(err => { return this.validate(err) })
  }

  async deleteComment (id, data) {
    return TaskModel.findByIdAndUpdate(id, { $pull: { comments: { _id: data.idComment } } })
      .then(res => { return { success: true, message: 'El comentario fue eliminado exitosamente' } })
      .catch(err => { return this.validate(err) })
  }
}

module.exports = Tasks
