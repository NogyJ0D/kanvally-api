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
    type: mongoose.SchemaTypes.ObjectId,
    required: [true, 'El proyecto debe tener el id del dueño'],
    ref: 'users'
  },

  teams: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'teams'
    }
  ],

  members: [
    {
      _id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users',
        unique: true
      },

      username: {
        type: String,
        required: [true, 'Ingrese el nombre de usuario invitado.']
      }
    }
  ]

})
projectSchema.plugin(uniqueValidator)

const projectModel = mongoose.model('projects', projectSchema)

module.exports = projectModel
