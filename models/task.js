const { mongoose } = require('../config/database')
const uniqueValidator = require('mongoose-unique-validator')

const taskSchema = new mongoose.Schema({
  idProject: {
    type: mongoose.SchemaTypes.ObjectId,
    required: [true, 'Ingrese el id del proyecto de la tarea.'],
    ref: 'projects'
  },

  idTeam: {
    type: mongoose.SchemaTypes.ObjectId,
    required: [true, 'Ingrese el id del equipo de la tarea.'],
    ref: 'teams'
  },

  state: {
    type: Number,
    required: [true, 'Ingrese el estado de la tarea.'],
    enum: [[0, 1, 2, 3, 4, 5, 6], 'El estado de la tarea debe ser 0, 1, 2, 3, 4, 5 o 6.'],
    default: 2
  },

  authorId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: [true, 'Ingrese su id.'],
    ref: 'users'
  },

  author: {
    type: String,
    required: [true, 'Ingrese su nombre de usuario.']
  },

  name: {
    type: String,
    required: [true, 'Ingrese el nombre de la tarea.'],
    maxlength: [24, 'El nombre de la tarea no puede tener mas de 24 caracteres.']
  },

  description: {
    type: String,
    required: [true, 'Ingrese la descripción de la tarea.']
  },

  fileKey: String,
  logoUrl: String,

  comments: [
    {
      username: {
        type: String,
        required: [true, 'Ingrese el usuario del comentario.']
      },

      text: {
        type: String,
        required: [true, 'Ingrese el texto del comentario.']
      },

      created_date: {
        type: Date,
        default: new Date(),
        immutable: true
      }
    }
  ]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
taskSchema.plugin(uniqueValidator)

const taskModel = mongoose.model('tasks', taskSchema)
module.exports = taskModel
