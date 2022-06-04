const ProjectModel = require('../models/project')
const UserModel = require('../models/user')
const TeamModel = require('../models/team')
const TaskModel = require('../models/task')
const sendEmail = require('../libs/email')
const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config')
const InvitationModel = require('../models/invitation')

class Projects {
  validate (error) {
    const errorMessages = Object.keys(error.errors).map(e => {
      const err = error.errors[e]
      if (err.kind === 'unique') return 'Ya existe un proyecto con ese nombre, intente con otro.'
      return err.message
    })
    return { fail: true, errorMessages }
  }

  // Ver proyectos
  async getAll () {
    return await ProjectModel.find()
  }

  async getProject (id) {
    try { return await ProjectModel.findById(id) } catch (error) { return error }
  }

  async getProjectTeams (id) {
    try { return await ProjectModel.findById(id).populate('teams') } catch (error) { return { fail: true, error } }
  }

  async getProjectMembers (id) {
    try { return await ProjectModel.findById(id).select('name members').populate('members._id', 'username email') } catch (error) { return { fail: true, error } }
  }

  async getProjectComplete (id) {
    try { return await ProjectModel.findById(id).populate('members._id', 'username email').populate('teams') } catch (error) { return { fail: true, error } }
  }

  async create (data) {
    if (data.logoUrl === '' || data.logoUrl === null) data.logoUrl = 'https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png?w=640'
    const project = await new ProjectModel(
      {
        name: data.name,
        idBoss: data.idBoss,
        logoUrl: data.logoUrl || null,
        members: [{
          _id: data.idBoss,
          role: 2,
          confirmed: true
        }]
      }).save()
    if (project.fail) return project
    return UserModel.findOneAndUpdate({ _id: data.idBoss }, { $push: { projects: project._id } }, { new: true }).populate({ path: 'projects', select: 'name logoUrl' })
      .then(res => {
        return { success: true, message: 'El proyecto fue creado con éxito.', userProjects: res.projects }
      })
      .catch(error => { return this.validate(error) })
  }

  // Reemplazarlo por específicos
  async update (id, data) {
    try { return await ProjectModel.findByIdAndUpdate(id, data, { runValidators: true, new: true }) } catch (error) { return { fail: true, error } }
  }

  async invite (projectId, { userEmail, userRole }) {
    const user = await UserModel.findOne({ email: userEmail, projects: { $ne: projectId } })
    if (!user) return { fail: true, err: 'Ese email no está registrado o el usuario ya es miembro del proyecto.' }

    const project = await ProjectModel.findOne({ _id: projectId, 'members._id': { $ne: user._id } })
    if (!project) return { fail: true, err: 'El proyecto no existe o el usuario ya es miembro del proyecto.' }

    const invitation = await InvitationModel.findOne({ user: user._id, project: projectId })
    if (invitation) return { fail: true, err: 'La invitación ya fue mandada anteriormente y está a espera de confirmación.' }

    return new InvitationModel({ user: user._id, project: projectId, userRole }).save()
      .then(async (res) => {
        const emailToken = jwt.sign({ user: user._id, project: projectId, userRole, invitationId: res._id }, jwtSecret, { expiresIn: '7d' })

        await sendEmail(
          userEmail,
          'Kanvally - Invitación a proyecto',
            `Te han invitado al proyecto "${project.name}"`,
            `<h1>Te han invitado al proyecto "${project.name}"</h1>
            <br>
            <a href='https://kanvally-api.onrender.com/projects/confirm/${emailToken}'>Aceptar la invitación</a>
            <small>Esta invitación vencerá en 7 días.</small>`
        )
        // https://kanvally-api.onrender.com url web
        // http://localhost:4000 url local

        return { success: true, message: 'La invitación ha sido enviada exitosamente.' }
      })
  }

  async confirmInvite (token) {
    try {
      const { user, project, userRole, invitationId } = jwt.verify(token, jwtSecret)
      await ProjectModel.findOneAndUpdate(
        { _id: project },
        { $push: { members: { _id: user, role: userRole } } })
      await UserModel.findOneAndUpdate(
        { _id: user },
        { $push: { projects: project } })
      await InvitationModel.findOneAndDelete({ _id: invitationId })
      return { success: true }
    } catch (err) {
      return { fail: true, err }
    }
  }

  async expel (id, userId) {
    try {
      await UserModel.updateOne(
        { _id: userId },
        { $pull: { projects: id } })
      await TeamModel.updateMany(
        { 'members._id': userId },
        { $pull: { members: { _id: userId } } })
      const project = await ProjectModel.updateOne(
        { _id: id },
        { $pull: { members: { _id: userId } } },
        { new: true })
      return { success: true, projectMembers: project.members, message: 'El usuario fue expulsado del proyecto exitosamente.' }
    } catch (error) { return { fail: true, error } }
  }

  // Eliminar el project del usuario
  async delete (id, user) {
    try {
      await ProjectModel.findByIdAndDelete(id)
      await TeamModel.deleteMany({ idProject: id })
      await TaskModel.deleteMany({ idProject: id })
      await UserModel.updateMany({ projects: id }, { $pull: { projects: id } })
      const User = await UserModel.findOne({ _id: user.id })
      return { success: true, message: 'El proyecto fue eliminado exitosamente.', userProjects: User.projects }
    } catch (error) {
      return { fail: true, error }
    }
  }
}

module.exports = Projects
