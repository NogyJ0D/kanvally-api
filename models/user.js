const { mongoose } = require('../config/database')

const userModel = mongoose.model(
  'users',
  new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      maxlength: 16
    },

    firstname: {
      type: String,
      maxlength: 32
    },

    lastname: {
      type: String,
      maxlength: 32
    },

    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100
    },

    password: String,

    role: {
      type: Number,
      default: 0
    },

    gender: {
      type: String,
      enum: ['Hombre', 'Mujer']
    },

    profile_pic: {
      type: String,
      default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
    },

    projects: [
      {
        _id: String,
        role: Number
      }
    ],

    provider: String,
    idProvider: String
  })
)

module.exports = userModel
