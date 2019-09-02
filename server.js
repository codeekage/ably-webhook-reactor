 // import dependcies
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { authController, webHookController } = require('./controller/app.controller')
const mongoose = require('mongoose')
const path = require('path')

// initialise express
const app = express()

// initialise application PORT
const PORT = process.env.PORT || 8080
//

const mongoDB_URL  = process.env.MONGODB_URL || 'mongodb://localhost:27017/ably'

console.log(mongoDB_URL)

// connect to MongoDB using Mongoose
mongoose.connect(mongoDB_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    reconnectTries: 5
  },
  err => {
    if (err) {
      console.error(`Error connecting to MongoDB: ${err}`)
      return
    }
    console.log(`connection to MongoDB was successful`)
  }
)

// setup middlewares
// Cross Origin Resource Sharing
app.use(cors())

// Parse JSON in Request Body
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//serve static files
app.use('/', express.static(path.join(__dirname, 'public')))

// application routes
app.post('/ably', webHookController)
// auth and genrate token
app.get('/auth', authController)

// start express server
app.listen(PORT, () => {
  console.info(`Application running on port : ${PORT}`)
})
 