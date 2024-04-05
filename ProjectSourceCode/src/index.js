const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
// const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.
const querystring = require('querystring');
const port = 3000;

// create `ExpressHandlebars` instance and configure the layouts and partials dir
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

// initialize
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

// Connect to database using the above details
const db = pgp(dbConfig);

const redirectURI = "http://localhost:3000/callback"

let accessToken = "";



// Initializing the App

// Register `hbs` as our view engine using its bound `engine()` function
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static(__dirname + '/')); // Allow for use of relative paths



// Endpoints for default behavior (use this for login procedure for now)

app.get('/', (req, res) => {
  res.redirect('login')
});

app.get('/login', (req, res) => {
  res.render("login")
});

app.post('/login', (req, res) => {
  
});

app.get('/home', (req, res) => {
  res.render("home")
});

app.post('/home', (req, res) => {
  
});

app.get('/about', (req, res) => {
  res.render("about")
});

app.post('/about', (req, res) => {
  
});


app.get('/loginwithspotify', (req, res) => {
  try {
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.CLIENT_ID,
      redirect_uri: redirectURI,
    }));
  } catch (err) { // Return to home page if failed to login
    console.log(err);
    res.redirect("/");
  }
});

// Spotify API will call this with stuff 
app.get('/callback', async (req, res) => {
  try {
    let code = req.query.code || null;

    const auth = 'Basic ' + (new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'));
    const data = querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectURI
    });

    // Exchange code for access token
    const response = await axios.post("https://accounts.spotify.com/api/token", data, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': auth
        }
      });

    accessToken = response.data.access_token;
    res.redirect("/home")
  } catch (err) { // Redirect to home if API call doesn't return something correctly or something like that
    console.log(err);
    res.redirect("/");
  } 
});



// sample endpoints for db testing 

app.get('/dbselect', (req, res) => {
  let query = `SELECT * FROM users;`;
  db.any(query)
  .then((rows) => {
    res.send(rows);
  })
  .catch((error) => {
    res.send({message : error});
  })
});

app.post('/dbinsert', (req, res) => {
  let query = `INSERT INTO users (username, password) VALUES ('${req.body.username}', '${req.body.password}');`;
  db.any(query)
  .then((rows) => {
    res.send({message : `Data entered successfully: username ${req.body.username}, password ${req.body.password}`});
  })
  .catch((error) => {
    res.send({message : error});
  })
});

app.delete('/dbdelete', (req, res) => {
  let query = `TRUNCATE users CASCADE;`;
  db.any(query)
  .then((rows) => {
    res.send({message : `Data cleared successfully`});
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

// Adjust the path to the views directory
app.set('views', path.join(__dirname, 'views', 'pages'));

// Route for loading the home page
app.get('/home', (req, res) => {
  res.render('home', { title: 'Home Page' }); // Assuming you have a view file named 'home.hbs' in your 'views/pages' directory
});

// open on port 3000

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});