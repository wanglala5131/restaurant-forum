const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const PORT = 3000

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')


require('./routes')(app)

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})