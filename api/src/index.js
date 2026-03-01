const express = require('express')
const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Запущен!')
})

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`)
})
