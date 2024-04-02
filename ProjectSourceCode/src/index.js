const express = require('express');
const app = express();
const port = 3000;

// sample endpoints for default behavior (use this for login procedure for now)

app.get('/', (req, res) => {
  res.redirect('/login');
})

app.get('/login', (req, res) => {
  
})

app.post('/login', (req, res) => {
  
})

// sample endpoints for db testing

app.get('/dbselect', (req, res) => {
  res.send('Hello World!');
})

app.post('/dbinsert', (req, res) => {
  res.send('Hello World!');
})

// sample endpoints for web service implementation (probably will rename and repurpose later?)

app.get('/apirequest', (req, res) => {
  res.send('Hello World!');
})

app.post('/apipost', (req, res) => {
  res.send('Hello World!');
})



// open on port 3000

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})