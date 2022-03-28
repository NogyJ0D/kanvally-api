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

  fileKey: String,
  logoUrl: String,

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

  tasks: {
    0: [{
      _id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'tasks'
      }
    }],
    1: [{
      _id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'tasks'
      }
    }],
    2: [{
      _id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'tasks'
      }
    }],
    3: [{
      _id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'tasks'
      }
    }],
    4: [{
      _id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'tasks'
      }
    }],
    5: [{
      _id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'tasks'
      }
    }],
    6: [{
      _id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'tasks'
      }
    }]
  }

  // tasks: [
  //   {
  //     type: mongoose.SchemaTypes.ObjectId,
  //     ref: 'tasks'
  //   }
  // ]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

const teamModel = mongoose.model('teams', teamSchema)
module.exports = teamModel
