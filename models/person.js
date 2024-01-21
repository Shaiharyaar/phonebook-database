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
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d{8,}$/.test(v)
      },
      message: (props) =>
        `${props.value} is not a valid phone number! Must be in the format XX-XXXXXXXX or XXX-XXXXXXXX.`,
    },
    message: (props) => `${props.value} is not a valid phone number!`,
  },
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
