const UserModel = require('../models/user')

class Users {
  async getByFilter (filter) {
    return await UserModel.findOne(filter)
  }

  async create (data) {
    return await UserModel.create(data)
  }

  async update (id, data) {
    return await UserModel.findByIdAndUpdate(id, data, { new: true })
  }
}

module.exports = Users
