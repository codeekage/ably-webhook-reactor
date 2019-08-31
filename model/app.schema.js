const mongoose = require('mongoose')

// initialise application schema
const ApplicatonSchema = new mongoose.Schema({
  timeLog: {
    type: Date,
    default: Date.now(),
    required: true
  },
  staffID: {
    type: String,
    required: true
  }
})

// export application model
exports.ApplicationModel = mongoose.model('timelog', ApplicatonSchema)
