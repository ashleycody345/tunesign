const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
// const Handlebars = require('handlebars');
const path = require('path');
// const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
// const bodyParser = require('body-parser');
// const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
// const bcrypt = require('bcrypt'); //  To hash passwords
// const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.
const querystring = require('querystring');
const port = 3000;

// create `ExpressHandlebars` instance and configure the layouts and partials dir
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

const redirectURI = "http://localhost:3000/callback"

// MUST HIDE BEFORE DEPLOYMENT
const clientID = "80cb40fc4c6f4cc9a7dd6ad33d600cbd";
const clientSecret = "027cd8c76fc947e7bc7c859b0e8f0b0c"; 

let accessToken = "";



// Initializing the App

// Register `hbs` as our view engine using its bound `engine()` function
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
// app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static(__dirname + '/')); // Allow for use of relative paths



// Endpoints for default behavior (use this for login procedure for now)

app.get('/', (req, res) => {

});

app.get('/login', (req, res) => {

});

app.get('/loginwithspotify', (req, res) => {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: "code",
      client_id: clientID,
      redirect_uri: redirectURI,
    }));
})

app.post('/login', (req, res) => {
  
})

// Spotify API will call this with stuff 
app.get('/callback', (req, res) => {
  let code = req.query.code || null;
  let state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirectURI,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(clientID + ':' + clientSecret).toString('base64'))
      },
      json: true
    };
  }
});

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
  console.log(`App listening on port ${port}`)
})