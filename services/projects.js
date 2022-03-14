const ProjectModel = require('../models/project')
const UserModel = require('../models/user')

class Projects {
  async getAll () {
    return await ProjectModel.find()
  }

  async getAllById (id) {
    try {
      return await ProjectModel.findById(id).populate('members._id')
    } catch (error) {
      return error
    }
  }

  async getByFilter (filter) {
    return await ProjectModel.findOne(filter)
  }

  async getTeamsByProjectId (id) {
    return await ProjectModel.find()
  }

  async getMembersByProject (id, filter) {
    if (filter === 'populated') return await ProjectModel.findById(id).select('members').populate('members._id')
    else return await ProjectModel.findById(id).select('members')
  }

  async create (data) {
    try {
      data.teams = []
      data.members = [{ _id: data.idBoss, username: data.username }]

      const project = new ProjectModel(data)
      const user = await UserModel.findById(data.idBoss)

      user.projects.push({ _id: project._id, role: 2, name: data.name })
      await user.save({ validateModifiedOnly: true })
      return await project.save()
    } catch (error) {
      const errorMessages = Object.keys(error.errors).map(e => {
        const err = error.errors[e]
        if (err.kind === 'unique') return 'Ya existe un proyecto con ese nombre, intente con otro.'
        return err.message
      })
      return { fail: true, errorMessages }
    }
  }

  // Reemplazarlo por específicos
  async update (id, data) {
    try {
      return await ProjectModel.findByIdAndUpdate(id, data, { runValidators: true, new: true })
    } catch (error) {
      return { fail: true, error }
    }
  }

  async invite (id, userData) {
    try {
      const project = await ProjectModel.findById(id)
      const user = await UserModel.findById(userData._id)
      project.members.push(userData)
      user.projects.push({ _id: id, role: 1, name: project.name })

      await user.save({ validateModifiedOnly: true })
      await project.save({ validateModifiedOnly: true })
      return { success: true, message: 'El usuario fue añadido con éxito.' }
    } catch (error) {
      const errorMessages = Object.keys(error.errors).map(e => {
        const err = error.errors[e]
        if (err.kind === 'unique') return 'Ese usuario ya fue invitado.'
        return err.message
      })
      return { fail: true, errorMessages }
    }
  }

  // Eliminar el project del usuario
  async delete (id) {
    try {
      return await ProjectModel.findByIdAndDelete(id)
    } catch (error) {
      return { fail: true, error }
    }
  }
}

module.exports = Projects
