const ProjectModel = require('../models/project')
const TeamModel = require('../models/team')

class Teams {
  async getAll () {
    return await TeamModel.find()
  }

  async getTeamById (id) {
    return await TeamModel.findById(id)
  }

  async GetByProjectId (id) {
    return await ProjectModel.findById(id).populate('teams')
  }

  async create (id, data) {
    try {
      data.idProject = id
      const savedTeam = await new TeamModel(data).save()

      const project = await ProjectModel.findById(id)
      project.teams.push(savedTeam._id)

      return await project.save()
    } catch (error) {
      const errorMessages = Object.keys(error.errors).map(e => {
        const err = error.errors[e]
        console.log(err)
        // if (err.kind === 'unique') return 'Ya existe un equipo en tu proyecto con ese nombre, intente otro.'
        return err.message
      })
      return { fail: true, errorMessages }
    }
  }

  async update (id, data) {
    try {
      return await TeamModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    } catch (error) {
      const errorMessages = Object.keys(error.errors).map(e => {
        const err = error.errors[e]
        console.log(err)
        // if (err.kind === 'unique') return 'Ya existe un equipo en tu proyecto con ese nombre, intente otro.'
        return err.message
      })
      return { fail: true, errorMessages }
    }
  }
}

module.exports = Teams
