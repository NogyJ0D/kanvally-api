const { mongoose } = require('../config/database')
const uniqueValidator = require('mongoose-unique-validator')

const taskSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: [true, 'Ingrese el id del equipo de la tarea.'],
    ref: 'teams'
  },

  state: {
    type: Number,
    required: [true, 'Ingrese el estado de la tarea.'],
    enum: [[0, 1, 2, 3, 4, 5], 'El estado de la tarea debe ser 0, 1, 2, 3, 4 o 5.'],
    default: 0
  },

  name: {
    type: String,
    required: [true, 'Ingrese el nombre de la tarea.'],
    maxlength: [16, 'El nombre de la tarea no puede tener mas de 16 caracteres.']
  },

  description: {
    type: String,
    required: [true, 'Ingrese la descripción de la tarea.']
  },

  cover_image: String,

  comments: [
    {
      username: {
        type: String,
        required: [true, 'Ingrese el usuario del comentario.']
      },

      text: {
        type: String,
        required: [true, 'Ingrese el texto del comentario.']
      }
    }
  ]
})
taskSchema.plugin(uniqueValidator)

const taskModel = mongoose.model('tasks', taskSchema)
module.exports = taskModel
