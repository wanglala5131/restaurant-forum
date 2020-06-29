const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const PORT = 3000

app.get('/', (req, res) => {
  res.send('2666')
})

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})