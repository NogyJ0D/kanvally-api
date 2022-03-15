const ProjectModel = require('../models/project')
const UserModel = require('../models/user')

class Projects {
  // Ver proyectos
  async getAll () {
    return await ProjectModel.find()
  }

  async getProject (id) {
    try {
      const project = await ProjectModel.findById(id)
      return project
    } catch (error) {
      return error
    }
  }

  async getProjectTeams (id) {
    try { return await ProjectModel.findById(id).select('name teams').populate('teams') } catch (error) { return { fail: true, error } }
  }

  async getProjectMembers (id) {
    try { return await ProjectModel.findById(id).select('name members').populate('members', 'username email') } catch (error) { return { fail: true, error } }
  }

  async getProjectComplete (id) {
    try { return await ProjectModel.findById(id).populate('members').populate('teams') } catch (error) { return { fail: true, error } }
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

  // Eliminar el project del usuario
  async delete (id) {
    try {
      await UserModel.updateMany({ projects: id }, { $pull: { projects: id } })
      await ProjectModel.findByIdAndDelete(id)
      return { success: true, message: 'El proyecto fue eliminado exitosamente.' }
    } catch (error) {
      return { fail: true, error }
    }
  }
}

module.exports = Projects
