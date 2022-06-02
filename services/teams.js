const ProjectModel = require('../models/project')
const TeamModel = require('../models/team')
const UserModel = require('../models/user')

class Teams {
  validate (error) {
    const errorMessages = Object.keys(error.errors).map(e => {
      const err = error.errors[e]
      if (err.kind === 'unique') return 'Ya existe un equipo en tu proyecto con ese nombre, intente otro.'
      return err.message
    })
    return { fail: true, errorMessages }
  }

  async getAll () {
    const teams = await TeamModel.find()
    if (!teams[0]) return { fail: true, error: 'No existen equipos.' }
    else return teams
  }

  async getById (id) {
    try {
      const team = await TeamModel.findById(id).populate({
        path: 'tasks.0._id tasks.1._id tasks.2._id tasks.3._id tasks.4._id tasks.5._id tasks.6._id'
      }).populate('members._id', '_id username email')
      return team
    } catch (error) { return { fail: true, error: 'El equipo no existe.' } }
  }

  async GetByProject (id) {
    try { return await ProjectModel.findById(id).select('name teams').populate('teams', 'name members') } catch (error) { return { fail: true, error } }
  }

  async create (id, data, file) {
    const project = await ProjectModel.findOne({ _id: id, 'members._id': data.idLeader })
    if (!project) return { fail: true, err: 'El usuario no es miembro del proyecto.' }

    return new TeamModel({
      name: data.name,
      // coverImage: uploaded.fileName,
      idLeader: data.idLeader,
      idProject: id,
      logoUrl: data.logoUrl || null,
      members: [{
        _id: data.idLeader,
        role: 'Líder'
      }],
      tasks: {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: []
      }
    }).save()
      .then(res => {
        return ProjectModel.updateOne({ _id: id }, { $push: { teams: { _id: res._id } } })
          .then(() => { return { success: true, message: 'El equipo fue creado exitosamente.' } })
          .catch(error => { return this.validate(error) })
      })
      .catch(error => { return this.validate(error) })
  }

  async addUser (id, { userid, role }) {
    try {
      const project = await ProjectModel.findOne({
        teams: id,
        'members._id': userid
      })
        .select({ teams: id })
        .populate({ path: 'teams', select: 'members' })

      if (project) {
        if (project.teams[0].members.find(member => member._id == userid)) {
          return { fail: true, error: 'El usuario ya pertenece al equipo.' }
        } else {
          await TeamModel.updateOne({ _id: id }, { $push: { members: { _id: userid, role } } }, { new: true, runValidators: true })
          return { success: true, message: 'El usuario fue agregado exitosamente.' }
        }
      } else return { fail: true, error: 'El usuario no pertenece al proyecto.' }
    } catch (error) {
      console.log(error)
      return { fail: true, error }
    }
  }

  async changeRole (id, { userId, userRole }) {
    if (userRole === 'Líder') return { fail: true, message: 'No puedes cambiar al líder del proyecto.' }
    return await TeamModel.findOneAndUpdate(
      { $and: [{ _id: id }, { 'members._id': userId }] },
      { $set: { 'members.$._id': userId, 'members.$.role': userRole } },
      { new: true, runValidators: true }
    ).then(res => {
      if (!res) return { fail: true, error: 'No se encuentra un usuario bajo esos parametros' }
      else return { success: true, message: 'El rol del usuario fue cambiado exitosamente.' }
    }).catch(err => { return this.validate(err) })
  }

  async expelUser (id, userId) {
    return await TeamModel.findOneAndUpdate(
      { $and: [{ _id: id }, { 'members._id': userId }] },
      { $pull: { members: { _id: userId } } }
    ).then(res => {
      if (!res) return { fail: true, error: 'No se encuentra un equipo bajo esos parámetros.' }
      else return { success: true, message: 'El usuario fue eliminado exitosamente del equipo.' }
    }).catch(err => { return { fail: true, error: err } })
  }

  // async update (id, data) {
  //   try {
  //     return await TeamModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  //   } catch (error) {
  //     const errorMessages = Object.keys(error.errors).map(e => {
  //       const err = error.errors[e]
  //       console.log(err)
  //       // if (err.kind === 'unique') return 'Ya existe un equipo en tu proyecto con ese nombre, intente otro.'
  //       return err.message
  //     })
  //     return { fail: true, errorMessages }
  //   }
  // }

  async delete (id) {
    try {
      const team = await TeamModel.findByIdAndDelete(id)
      await ProjectModel.updateOne({ teams: team._id }, { $pull: { teams: team._id } })
      return { success: true, message: 'El equipo fue eliminado con éxito.' }
    } catch (error) {
      return { fail: true, error }
    }
  }
}

module.exports = Teams
