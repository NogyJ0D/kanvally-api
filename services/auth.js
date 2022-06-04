const Users = require('./users')
const UserModel = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendEmail = require('../libs/email')
const { jwtSecret } = require('../config')

class Auth {
  constructor () {
    this.users = new Users()
  }

  getToken (user) {
    const data = {
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      id: user.id,
      role: user.role,
      profile_pic: user.profile_pic,
      projects: user.projects
    }
    const token = jwt.sign({ username: data.username, email: data.email, id: data.id, role: data.role }, jwtSecret, { expiresIn: '7d' })
    return { data, token }
  }

  async login (email, password) {
    if (!email || !password) {
      return { fail: true, err: 'Ingrese ambas credenciales.' }
    }

    const user = await this.users.getByFilter({ email })

    if (user) {
      const dehashedPassword = await bcrypt.compare(password, user.password)
      if (dehashedPassword) {
        return this.getToken(user)
      } else return { fail: true, err: 'Las credenciales no coinciden.' }
    } else return { fail: true, err: 'El usuario no existe.' }
  }

  async signup (userData) {
    if (await this.users.getByFilter({ email: userData.email })) {
      return { fail: true, err: 'Este email ya está en uso.' }
    } else if (await this.users.getByFilter({ username: userData.username })) {
      return { fail: true, err: 'Este nombre de usuario ya está en uso.' }
    } else if (!userData.password || !userData.firstname || !userData.lastname) return { fail: true, err: 'Ingrese todos los campos requeridos.' }

    const user = new UserModel(userData)

    const salt = await bcrypt.genSalt(10)
    user.role = 0
    user.projects = []
    user.password = await bcrypt.hash(user.password, salt)

    await this.users.create(user)

    const emailToken = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '1d' })
    await sendEmail(
      user.email,
      'Registro exitoso',
      '¡Gracias por entrar a Kanvally!',
      `<h1>¡Gracias por entrar a Kanvally!</h1>
      <br>
      <a href='https://kanvally-api.onrender.com/auth/email/${emailToken}'>Valida tu email</a>`
    )

    return { success: true, message: 'Registro exitoso, valida tu email para ingresar.' }
  }

  async emailValidate (token) {
    try {
      const { id, role } = jwt.verify(token, jwtSecret)
      if (role === 0) return this.users.update(id, { role: 1 })
      else return { fail: true, err: 'Tu email ya fue validado.' }
    } catch (err) {
      return { fail: true, err }
    }
  }
}

module.exports = Auth
