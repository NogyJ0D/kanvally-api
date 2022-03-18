const ProjectModel = require('../models/project')
const TeamModel = require('../models/team')

class Teams {
  validate (error) {
    const errorMessages = Object.keys(error.errors).map(e => {
      const err = error.errors[e]
      // if (err.kind === 'unique') return 'Ya existe un equipo en tu proyecto con ese nombre, intente otro.'
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
      const team = await TeamModel.findById(id).populate('members')
      return team
    } catch (error) { return { fail: true, error: 'El equipo no existe.' } }
  }

  async GetByProject (id) {
    try { return await ProjectModel.findById(id).select('name teams').populate('teams', 'name members') } catch (error) { return { fail: true, error } }
  }

  async create (id, data) {
    try {
      const savedTeam = await new TeamModel({
        name: data.name,
        idLeader: data.idLeader,
        idProject: id,
        members: [{
          _id: data.idLeader,
          role: 'Líder'
        }]
      }).save()
      await ProjectModel.updateOne({ _id: id }, { $push: { teams: { _id: savedTeam._id } } })
      return savedTeam
    } catch (error) {
      console.log(error)
      const errorMessages = Object.keys(error.errors).map(e => {
        const err = error.errors[e]
        console.log(err)
        if (err.kind === 'unique') return 'Ya existe un equipo en tu proyecto con ese nombre, intente otro.'
        return err.message
      })
      return { fail: true, errorMessages }
    }
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
