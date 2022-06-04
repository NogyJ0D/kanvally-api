const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
// const morgan = require('morgan')
// const rfs = require('rotating-file-stream')

const app = express()

// MongoDB
const { connection } = require('./config/database')
connection()

// Morgan files
// const rfsStream = rfs.createStream('./logs/log.txt', {
//   size: '10M',
//   interval: '1d',
//   compress: 'gzip'
// })
// app.use(morgan('common', { stream: rfsStream }))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000', 'https://kanvally.onrender.com']
}))

// Routing
const authRoutes = require('./routes/auth')
authRoutes(app)
const projectsRoutes = require('./routes/projects')
projectsRoutes(app)
const teamsRoutes = require('./routes/teams')
teamsRoutes(app)
const usersRoutes = require('./routes/users')
usersRoutes(app)
const tasksRoutes = require('./routes/tasks')
tasksRoutes(app)

// Starting
const { port } = require('./config')
app.listen(port, () => {
  console.log('Working on port ' + port)
})
app.get('/', (req, res) => { return res.send('Kanvally API working on port ' + port) })
