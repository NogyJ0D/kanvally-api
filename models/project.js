const { mongoose } = require('../config/database')
const uniqueValidator = require('mongoose-unique-validator')

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingrese el nombre del proyecto.'],
    unique: true,
    maxlength: [32, 'El nombre del proyecto no puede tener mas de 32 caracteres.']
  },

  idBoss: {
    type: String,
    required: [true, 'El proyecto debe tener el id del dueño']
  },

  teams: [
    {
      name: {
        type: String,
        required: [true, 'Ingrese el nombre del equipo.'],
        maxlength: [32, 'El nombre del equipo no puede tener mas de 32 caracteres.']
      },

      idLeader: String,

      members: [
        {
          _id: {
            type: String,
            required: [true, 'Ingrese los id de los miembros.']
          },

          username: {
            type: String,
            required: [true, 'Ingrese el nombre de usuario de los miembros.']
          },

          role: {
            type: Number,
            required: [true, 'Ingrese los roles de los miembros.'],
            default: 1
          }
        }
      ]
    }
  ]
})
projectSchema.plugin(uniqueValidator)

const projectModel = mongoose.model('projects', projectSchema)

module.exports = projectModel
