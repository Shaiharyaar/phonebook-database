const mongoose = require('mongoose')

const password = process.argv[2]
const url = process.env.MONGODB_URI
// const url = `mongodb+srv://fullstack:${password}@cluster0.vyaxhxh.mongodb.net/personApp?retryWrites=true&w=majority`
console.log('connecting to', url)

mongoose.set('strictQuery', false)
mongoose
  .connect(url)
  .then((result) => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Person = mongoose.model('Person', personSchema)

module.exports = Person
