const TaskModel = require('../models/task')
const TeamModel = require('../models/team')

class Tasks {
  validate (error) {
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
    return TeamModel.findOne({ _id: data.idTeam, 'members._id': data.author, idProject: data.idProject })
      .then(res => {
        if (!res) return { fail: true, error: 'No existe un equipo con esos parámetros.' }
        return new TaskModel(data).save()
          .then(res => {
            return TeamModel.findOneAndUpdate({ _id: data.idTeam }, { $push: { tasks: res._id } })
          })
          .catch(error => { return this.validate(error) })
      })
  }

  async changeState (id, data) {
    return TaskModel.findByIdAndUpdate(id, { state: data.state }, { new: true, runValidators: true })
      .then(res => {
        return res
      })
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
        return res
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
