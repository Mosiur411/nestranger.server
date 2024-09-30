const mongoose = require('mongoose')
mongoose.set('strictQuery', true);
const connectDatabase = (mongodb_uri) => {
  try {
    mongoose.connect(mongodb_uri)
    mongoose.connection.on('connected', () => {
    })
  } catch (error) {
  }
}

module.exports = {
  connectDatabase
}