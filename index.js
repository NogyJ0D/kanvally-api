const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()

// MongoDB
const { connection } = require('./config/database')
connection()

// Middleware
app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000']
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
const { port, env } = require('./config')
app.listen(port, () => {
  console.log('Node environment: ' + env || 'production')
  console.log('Working on port ' + port)
})
app.get('/', (req, res) => { return res.send('Kanvally API working on port ' + port) })
