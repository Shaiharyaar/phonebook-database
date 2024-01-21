require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
// adding middlewares
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const generateUniqueId = () => Math.floor(Math.random() * 100000000000000000000)

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})
let persons = []
app.get('/info', (request, response) => {
  response.send(
    `<div><p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p></div>`
  )
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findById(id).then((person) => {
    response.json(person)
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Name or number is missing',
    })
  } else if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({
      error: 'Name must be unique',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then((savedPerson) => {
    response.json(savedPerson)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((person) => person.id === id)
  if (person) {
    persons = persons.filter((note) => note.id !== id)
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
