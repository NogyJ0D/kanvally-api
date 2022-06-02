require('dotenv').config()

const config = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  // Mongo
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  // Sendgrid
  emailKey: process.env.SENDGRID_APIKEY
}

module.exports = config
