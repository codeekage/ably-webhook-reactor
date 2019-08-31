// import dependcies
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { authTrigger, ablyTrigger } = require('./triggers/app.http.trigger')
const mongoose = require('mongoose')

// initialise express
const app = express()

// initialise application PORT
const PORT = process.env.PORT || 8080

// connect to MongoDB using Mongoose
mongoose.connect(
  'mongodb+srv://ably-reactor:5Fm9TmDREzVNrxp@cluster0-etojd.gcp.mongodb.net/test?retryWrites=true&w=majority',
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
    console.log(`connection to MongoDB was successfull`)
  }
)

// setup middlewares
// Cross Origin Resource Sharing
app.use(cors())

// Parse JSON in Request Body
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// application routes
app.post('/ably', ablyTrigger)
// auth and genrate token
app.get('/auth', authTrigger)

// start express server
app.listen(PORT, () => {
  console.info(`Application running on port : ${PORT}`)
})
