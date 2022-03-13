const { mongoose } = require('../config/database')

const taskModel = mongoose.model(
  'tasks',
  new mongoose.Schema({
    teamId: {
      type: String,
      required: true
    },

    state: {
      type: Number,
      required: true,
      default: 0
    },

    name: {
      type: String,
      required: true,
      unique: true,
      maxlength: 16
    },

    description: {
      type: String,
      required: true
    },

    comments: [
      {
        username: {
          type: String,
          required: true
        },

        text: {
          type: String,
          required: true
        }
      }
    ]
  })
)

module.exports = taskModel
