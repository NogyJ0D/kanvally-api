const UserModel = require('../models/user')

class Users {
  async getAll () {
    return await UserModel.find()
  }

  async getByFilter (filter) {
    try { return await UserModel.findOne(filter).populate({ path: 'projects', select: 'name logoUrl' }) } catch (error) { return { fail: true, error } }
  }

  async getById (id) {
    try { return await UserModel.findById(id) } catch (error) { return { fail: true, error } }
  }

  async getProjects (id) {
    return await UserModel.findById(id).select('projects').populate({ path: 'projects', select: 'name logoUrl', options: { sort: 'name' } })
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
