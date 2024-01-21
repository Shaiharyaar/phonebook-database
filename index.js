require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// adding middlewares
app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(express.static('dist'))
// app.use(requestLogger)

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then((persons) => {
      response.json(persons)
    })
    .catch((err) => {
      // console.log({ err })
      response.status(500).end()
    })
})
app.get('/info', (request, response) => {
  response.send(
    `<div><p>Phonebook has info for ${Person.length} people</p><p>${new Date()}</p></div>`
  )
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save({ validateBeforeSave: true })
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((err) => next(err))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  Person.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then((person) => {
      if (person) {
        response.status(204).end()
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.use(errorHandler)
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
