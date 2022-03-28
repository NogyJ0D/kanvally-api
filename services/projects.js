const ProjectModel = require('../models/project')
const UserModel = require('../models/user')
const TeamModel = require('../models/team')
const TaskModel = require('../models/task')
const sendEmail = require('../libs/email')
const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config')
const InvitationModel = require('../models/invitation')
const { uploadFile } = require('../libs/storage')

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

  // Modificar proyectos
  async create (data, file) {
    let uploaded
    if (file) uploaded = await uploadFile(file?.originalname, file?.buffer)
    if (uploaded?.success) {
      const fileKey = uploaded.fileName
      const logoUrl = `/files/${uploaded.fileName}`
      return new ProjectModel(
        {
          name: data.name,
          idBoss: data.idBoss,
          fileKey,
          logoUrl,
          members: [{
            _id: data.idBoss,
            role: 2,
            confirmed: true
          }]
        })
        .save()
        .then(res => {
          if (res.fail) return res
          else {
            return UserModel.updateOne({ _id: data.idBoss }, { $push: { projects: res._id } })
              .then(res => { return { success: true, message: 'El proyecto fue creado con éxito.' } })
          }
        })
        .catch(error => { return this.validate(error) })
    } else {
      return new ProjectModel(
        {
          name: data.name,
          idBoss: data.idBoss,
          fileKey: 'kelly-sikkema-N3o-leQyFsI-unsplash.jpg',
          logoUrl: '/files/kelly-sikkema-N3o-leQyFsI-unsplash.jpg',
          members: [{
            _id: data.idBoss,
            role: 2,
            confirmed: true
          }]
        })
        .save()
        .then(res => {
          if (res.fail) return res
          else {
            return UserModel.updateOne({ _id: data.idBoss }, { $push: { projects: res._id } })
              .then(res => { return { success: true, message: 'El proyecto fue creado con éxito.' } })
          }
        })
        .catch(error => { return this.validate(error) })
    }
  }

  // Reemplazarlo por específicos
  async update (id, data) {
    try { return await ProjectModel.findByIdAndUpdate(id, data, { runValidators: true, new: true }) } catch (error) { return { fail: true, error } }
  }

  async invite (projectId, { userEmail, userRole }) {
    const user = await UserModel.findOne({ email: userEmail, projects: { $ne: projectId } })
    if (!user) return { fail: true, err: 'Ese email no está registrado o el usuario ya es miembro del proyecto.' }

    const project = await ProjectModel.findOne({ _id: projectId, 'members._id': { $ne: user._id } })
    if (!project) return { fail: true, err: 'El proyecto no existe o el usuario ya es miembro.' }

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
            <a href='http://localhost:4000/projects/confirm/${emailToken}'>Aceptar la invitación</a>
            <small>Esta invitación vencerá en 7 días.</small>`
        )

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
      return { success: true, message: 'La invitación fue aceptada con éxito.' }
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
      await ProjectModel.updateOne(
        { _id: id },
        { $pull: { members: { _id: userId } } })
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
