const { mongoose } = require('../config/database')

const memberSchema = new mongoose.Schema({
  _id: {
    type: mongoose.SchemaTypes.ObjectId,
    required: [true, 'Ingrese el id de los miembros del equipo.'],
    ref: 'users'
  },

  role: {
    type: String,
    enum: {
      values: ['Miembro', 'Tester', 'Líder'],
      message: 'El rol debe ser "Miembro", "Tester" o "Líder"'
    },
    required: [true, 'Ingrese el rol de los miembros del equipo.']
  }
})

const teamSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingrese el nombre del equipo.'],
    maxlength: [32, 'El nombre del equipo no puede tener mas de 32 caracteres.']
  },

  idProject: {
    type: mongoose.SchemaTypes.ObjectId,
    required: [true, 'Ingrese el id del proyecto al que pertenece.'],
    ref: 'projects'
  },

  idLeader: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
    required: [true, 'Ingrese el id del líder del equipo.']
  },

  members: [memberSchema],

  tasks: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'tasks'
    }
  ]
})

const teamModel = mongoose.model('teams', teamSchema)
module.exports = teamModel
