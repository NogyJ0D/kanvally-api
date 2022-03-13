const ProjectModel = require('../models/project')

class Projects {
  async validate (project) {
    const error = await project.validate()
    console.log('EL ERROR ES ' + error)
    if (error) {
      const errorMessages = Object.keys(error.errors).map(e => {
        const err = error.errors[e]

        if (err.kind === 'unique') return 'Ese nombre ya está en uso, intente con otro.'

        return err.message
      })
      return { error: true, errorMessages }
    } else return { error: false }
  }

  async getAll () {
    return await ProjectModel.find()
  }

  async getByFilter (filter) {
    return await ProjectModel.findOne(filter)
  }

  async create (data) {
    const project = new ProjectModel(data)

    try {
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

  async update (id, data) {
    try {
      return await ProjectModel.findByIdAndUpdate(id, data, { new: true })
    } catch (error) {
      return { fail: true, error }
    }
  }

  async delete (id) {
    try {
      return await ProjectModel.findByIdAndDelete(id)
    } catch (error) {
      return { fail: true, error }
    }
  }
}

module.exports = Projects
