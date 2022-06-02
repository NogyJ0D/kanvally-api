const { mongoose } = require('../config/database')
const uniqueValidator = require('mongoose-unique-validator')

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingrese el nombre del proyecto.'],
    maxlength: [32, 'El nombre del proyecto no puede tener mas de 32 caracteres.']
  },

  idBoss: {
    type: mongoose.SchemaTypes.ObjectId,
    required: [true, 'El proyecto debe tener el id del dueño'],
    ref: 'users'
  },

  logoUrl: {
    type: String,
    default: 'https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png?w=640'
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
        ref: 'users'
      },

      role: {
        type: Number,
        enum: [1, 2],
        default: 1
      }
    }
  ]

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
projectSchema.plugin(uniqueValidator)

const projectModel = mongoose.model('projects', projectSchema)
module.exports = projectModel
