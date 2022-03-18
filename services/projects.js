const ProjectModel = require('../models/project')
const UserModel = require('../models/user')
const TeamModel = require('../models/team')
const TaskModel = require('../models/task')

class Projects {
  // Ver proyectos
  async getAll () {
    return await ProjectModel.find()
  }

  async getProject (id) {
    try { return await ProjectModel.findById(id) } catch (error) { return error }
  }

  async getProjectTeams (id) {
    try { return await ProjectModel.findById(id).select('name teams').populate('teams') } catch (error) { return { fail: true, error } }
  }

  async getProjectMembers (id) {
    try { return await ProjectModel.findById(id).select('name members').populate('members._id', 'username email') } catch (error) { return { fail: true, error } }
  }

  async getProjectComplete (id) {
    try { return await ProjectModel.findById(id).populate('members._id', 'username email').populate('teams') } catch (error) { return { fail: true, error } }
  }

  // Modificar proyectos
  async create (data) {
    try {
      const project = await new ProjectModel({ name: data.name, idBoss: data.idBoss, logo: data.logo || null, members: [{ _id: data.idBoss, role: 2 }] })
      await UserModel.updateOne({ _id: data.idBoss }, { $push: { projects: project._id } })
      return await project.save()
      // return await project.save()
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
    try { return await ProjectModel.findByIdAndUpdate(id, data, { runValidators: true, new: true }) } catch (error) { return { fail: true, error } }
  }

  async invite (id, data) {
    try {
      await UserModel.updateOne({ _id: data.userid }, { $push: { projects: id } }, { runValidators: true })
      await ProjectModel.updateOne({ _id: id }, { $push: { members: { _id: data.userid, role: data.role || 1 } } }, { runValidators: true })
      return { success: true, message: 'El usuario fue añadido con éxito.' }
    } catch (error) {
      console.log(error)
      const errorMessages = Object.keys(error.errors).map(e => {
        const err = error.errors[e]
        if (err.kind === 'unique') return 'Ese usuario ya fue invitado.'
        return err.message
      })
      return { fail: true, errorMessages }
    }
  }

  async expel (id, userId) {
    try {
      await UserModel.updateOne({ _id: userId }, { $pull: { projects: id } })
      await TeamModel.updateMany({ 'members._id': userId }, { $pull: { members: { _id: userId } } })
      await ProjectModel.updateOne({ _id: id }, { $pull: { members: { _id: userId } } })
      return { success: true, message: 'El usuario fue expulsado del proyecto exitosamente.' }
    } catch (error) { return { fail: true, error } }
  }

  // Eliminar el project del usuario
  async delete (id) {
    try {
      await ProjectModel.findByIdAndDelete(id)
      await TeamModel.deleteMany({ idProject: id })
      await TaskModel.deleteMany({ idProject: id })
      await UserModel.updateMany({ projects: id }, { $pull: { projects: id } })
      // const teams = await ProjectModel.findById(id).select('teams')
      // const teams = await TeamModel.find({ idProject: id })
      // // await TeamModel.deleteMany({ idProject: id })
      // await TaskModel.deleteMany({  })
      // await ProjectModel.findByIdAndDelete(id)
      return { success: true, message: 'El proyecto fue eliminado exitosamente.' }
    } catch (error) {
      return { fail: true, error }
    }
  }
}

module.exports = Projects
