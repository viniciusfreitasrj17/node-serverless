const express = require('express')
const mongoose = require('mongoose')
const bent = require('bent')
const Cep = require('./Cep')

const app = express()

app.use(express.json())
mongoose.connect('mongodb://localhost:27017/cep_cache', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.get('/cep/:cepTyped', async (req, res) => {
  const { cepTyped } = req.params
  const cached  = await Cep.findOne({ zipcode: cepTyped })

  if (cached) {
    return res.status(200).json({ from: 'cached', info: cached })
  }

  const { cep, uf, cidade, bairro, logradouro } = await bent(
    'GET', 
    `http://cep.la/`, 
    'json', 
    { Accept: 'application/json' }
  )(`/${cepTyped}`)

  const created = await Cep.create({
    zipcode: cep,
    state: uf,
    city: cidade,
    neighborhood: bairro,
    comp: logradouro,
  })
  
  return res.status(201).json({ from: 'created', info: created })
})

module.exports = app