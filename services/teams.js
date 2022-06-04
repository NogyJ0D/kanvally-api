const ProjectModel = require('../models/project')
const TeamModel = require('../models/team')
const tasksService = require('./tasks')

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

  async create (id, data) {
    if (data.logoUrl === '' || data.logoUrl === null) data.logoUrl = 'https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png?w=640'
    const project = await ProjectModel.findOne({ _id: id, 'members._id': data.idLeader })
    if (!project) return { fail: true, err: 'El usuario no es miembro del proyecto.' }

    const members = [{
      _id: data.idLeader,
      role: 'Líder'
    }]
    if (data.idLeader !== project.idBoss) members.push({ _id: project.idBoss, role: 'Lector' })

    return new TeamModel({
      name: data.name,
      idLeader: data.idLeader,
      idProject: id,
      logoUrl: data.logoUrl,
      members,
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
        return ProjectModel.findOneAndUpdate({ _id: id }, { $push: { teams: { _id: res._id } } }, { new: true })
          .populate('teams')
          .then(res2 => { console.log(res2); return { success: true, message: 'El equipo fue creado exitosamente.', teams: res2.teams } })
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
          const team = await TeamModel.findOneAndUpdate({ _id: id }, { $push: { members: { _id: userid, role } } }, { new: true, runValidators: true }).populate('members._id', '_id username email')
          return { success: true, message: 'El usuario fue agregado exitosamente.', teamMembers: team.members }
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
    ).populate('members._id', '_id username email').then(res => {
      if (!res) return { fail: true, error: 'No se encuentra un usuario bajo esos parámetros.' }
      else return { success: true, message: 'El rol del usuario fue cambiado exitosamente.', team: res }
    }).catch(err => { return this.validate(err) })
  }

  async expelUser (id, userId) {
    return await TeamModel.findOneAndUpdate(
      { $and: [{ _id: id }, { 'members._id': userId }] },
      { $pull: { members: { _id: userId } } },
      { new: true }
    ).populate('members._id', '_id username email').then(res => {
      if (!res) return { fail: true, error: 'No se encuentra un equipo bajo esos parámetros.' }
      else return { success: true, message: 'El usuario fue eliminado exitosamente del equipo.', teamMembers: res.members }
    }).catch(err => { return { fail: true, error: err } })
  }

  async delete (id) {
    try {
      await tasksService.deleteByTeam(id)
      const team = await TeamModel.findByIdAndDelete(id)
      const project = await ProjectModel.findOneAndUpdate({ teams: team._id }, { $pull: { teams: team._id } }, { new: true })
      return { success: true, message: 'El equipo fue eliminado con éxito.', projectTeams: project.teams }
    } catch (error) {
      return { fail: true, error }
    }
  }
}

module.exports = Teams
