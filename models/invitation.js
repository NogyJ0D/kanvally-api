const { mongoose } = require('../config/database')

const invitationSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
    required: true
  },

  project: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'projects',
    required: true
  },

  userRole: {
    type: Number,
    enum: [1, 2],
    default: 1
  },

  pending: {
    type: Boolean,
    default: true
  },

  expire_at: {
    type: Date,
    default: Date.now
    // expires: 604800
  }
})
invitationSchema.index({ expire_at: 1 }, { expires: 604800 })

const invitationModel = mongoose.model('invitations', invitationSchema)
module.exports = invitationModel
