require('dotenv').config()

const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  // Mongo
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  // Passport
  callbackUrl: process.env.NODE_ENV === 'dev'
    ? process.env.CALLBACK_URL_DEVELOPMENT + ':' + process.env.PORT
    : process.env.CALLBACK_URL,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  // Sendgrid
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailSecure: process.env.EMAIL_SECURE,
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  // Files
  bucketName: process.env.BUCKET_NAME
}

module.exports = config
