const { mongoose } = require('../config/database')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Ingrese el nombre de usuario.'],
    unique: true,
    maxlength: [16, 'El nombre de usuario no puede tener mas de 16 caracteres.']
  },

  firstname: {
    type: String,
    maxlength: [32, 'El nombre no puede tener mas de 32 caracteres.']
  },

  lastname: {
    type: String,
    maxlength: [32, 'El apellido no puede tener mas de 32 caracteres.']
  },

  email: {
    type: String,
    required: [true, 'Ingrese el email.'],
    unique: true,
    maxlength: [100, 'El email no puede tener mas de 100 caracteres.'],
    lowercase: true
  },

  password: String,

  role: {
    type: Number,
    enum: [[0, 1, 2], 'El rol del usuario debe ser 0, 1 o 2'],
    default: 0
  },

  profile_pic: {
    type: String,
    default: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'
  },

  projects: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'projects'
    }
  ],

  provider: String,
  idProvider: String
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
userSchema.plugin(uniqueValidator)

const userModel = mongoose.model('users', userSchema)
module.exports = userModel
