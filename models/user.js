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

  createdAt: {
    type: Date,
    default: () => Date.now(),
    immutable: [true, 'No puede alterar la fecha de creación de un usuario.']
  },

  role: {
    type: Number,
    enum: [[0, 1, 2], 'El rol del usuario debe ser 0, 1 o 2'],
    default: 0
  },

  profile_pic: {
    type: String,
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },

  projects: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'projects'
    }
  ],

  provider: String,
  idProvider: String
})
userSchema.plugin(uniqueValidator)

const userModel = mongoose.model('users', userSchema)
module.exports = userModel
