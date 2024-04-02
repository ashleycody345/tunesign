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
  let query = `SELECT * FROM users;`;
  db.one(query)
  .then((rows) => {
    res.send(rows);
  })
  .catch((error) => {
    res.send({message : error});
  })
});

app.post('/dbinsert', (req, res) => {
  let query = `INSERT INTO users (username, password) VALUES (${req.body.username}, ${req.body.password});`;
  db.one(query)
  .then((rows) => {
    res.send(rows);
  })
  .catch((error) => {
    res.send({message : error});
  })
});

app.delete('/dbdelete', (req, res) => {
  let query = `TRUNCATE users;`;
  db.one(query)
  .then((rows) => {
    res.send(rows);
  })
  .catch((error) => {
    res.send({message : error});
  })
});

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