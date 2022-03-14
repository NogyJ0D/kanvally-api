const UserModel = require('../models/user')

class Users {
  async getByFilter (filter) {
    return await UserModel.findOne(filter)
  }

  async create (data) {
    const user = new UserModel(data)

    try {
      return await user.save()
    } catch (error) {
      const errorMessages = Object.keys(error.errors).map(e => {
        const err = error.errors[e]
        // if (err.kind === 'unique') return 'Ya existe un usuario con ese nombre, intente con otro.'
        console.log(err)
        return err.message
      })
      return { fail: true, errorMessages }
    }
  }

  async update (id, data) {
    return await UserModel.findByIdAndUpdate(id, data, { new: true })
  }
}

module.exports = Users
