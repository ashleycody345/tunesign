
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
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

// const redirectURI = "http://recitation-14-team-03.eastus.cloudapp.azure.com:3000/callback";
const redirectURI = "http://localhost:3000/callback"; // For local hosting

// Initializing the App

// Register `hbs` as our view engine using its bound `engine()` function
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static(__dirname + '/')); // Allow for use of relative paths

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// functions to query from db

/**  returns query to select all genres and scores for a particular user
 // columns: rows.username, rows.genreName, rows.usergenrescore */
function dbSelectUserGenres(username){
  return `SELECT username, genreName, usergenrescore FROM users_to_genres WHERE username = '${username}';`;
}

/** 
 * returns query to retrieve one row with only the hashed password associated with username
 * // columns: rows.password */
function dbRetrieveHashedPassword(username){
  return `SELECT password FROM users WHERE username = '${username}' LIMIT 1;`;
}
/**
// returns query to push a user with a genre and a score
// columns: none
*/
function dbInsertUserGenre(username, genreName, score){
  return `INSERT INTO users_to_genres (username, genreName, usergenrescore) VALUES ('${username}', '${genreName}', ${score});`;
}
/**
// returns query to insert genre
// columns: none
*/
function dbInsertGenre(genreName, topzodiac, secondzodiac){
  return `INSERT INTO genres (genreName, topzodiac, secondzodiac) VALUES ('${genreName}', '${topzodiac}', '${secondzodiac}');`;
}

/**
// returns query to assign existing user a zodiac
// columns: noned
*/
function dbAddUserZodiac(username, zodiac){
  return `UPDATE users SET zodiac = '${zodiac}' WHERE username = '${username}' RETURNING *;`;
}

/**
// returns a user's zodiac and description
// columns: rows.user, rows.zodiac, rows.desc
*/
function dbRetrieveUserZodiac(username){
  return `SELECT u.username AS user, z.zodiac AS zodiac, z.description AS desc FROM zodiacs z, users u WHERE u.username = '${username}' AND u.zodiac = z.zodiac`;
}

/**
// returns a genre's zodiac and description
// columns: rows.zodiac, rows.desc, two rows returned (rows[0], rows[1])
*/
function dbRetrieveGenreZodiacs(genreName){
  return `SELECT z.zodiac AS zodiac, z.description AS desc FROM zodiacs z, genres g WHERE g.genreName = '${genreName}' AND (z.zodiac = g.topzodiac OR z.zodiac = g.secondzodiac);`;
}



// Endpoints for default behavior (use this for login procedure for now)

app.get('/', (req, res) => {
  res.redirect('about');
});



// Lab 11 Stuff
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

// Render register page
app.get("/register", (req, res) => {
  if (req.session.user != null) { // Go to home page if logged in
    res.redirect("/home");
  }

  res.render("register");
});

// Register
app.post('/register', async (req, res) => {
  if(typeof(req.body.username) == 'string' && typeof(req.body.password) == 'string'){
    try {
      const encryptedPassword = await bcrypt.hash(req.body.password, 10);

      let query = `INSERT INTO users (username, password) VALUES ('${req.body.username}', '${encryptedPassword}');`;
      db.any(query)
      .then((rows) => {
          res.status(302);
          res.redirect("/login");
      })
      .catch((error) => {
        res.status(500);
        res.render("register", {
          error: true,
          message: "Username already exists"
        });
    })
    } catch (err) {
      res.status(400);
      res.render("register", {
        error: true,
        message: "Registration error"
      });
    }
  }
  else{
    res.status(400);
    res.render("register", {
      error: true,
      message: "Registration error"
    });  
  }
});
// End Lab 11 Stuff



app.get('/login', (req, res) => {
  if (req.session.user != null) { // Go to home page if logged in
    res.redirect("/home");
  }

  res.render("login");
});

app.post('/login', async (req, res) => {
  try {
    user = await db.one(`SELECT * FROM users WHERE username = '${req.body.username}'`);

    // Check password match
    const match = bcrypt.compare(req.body.password, user.password);

    if (match) {
      req.session.user = user;
      req.session.save();
      res.redirect("/home");
    } else {
      res.render("login", {
        error: true,
        message: "Incorrect Username or Password"
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400);  
    res.render("login", {
      error: true,
      message: "Incorrect Username or Password"
    });
  }
});

app.get('/home', async (req, res) => {
  // Check if user is logged into website
  if (req.session.user) {
    // Check if user is logged into Spotify
    if (req.session.accessToken) {
      let userZodiac;
      let zodiacDescription;

      // Get zodiac sign if exists, calculate if not already exists
      try {
        if(req.session.user.zodiac){
          userZodiac = req.session.user.zodiac;
        }
        else {
          userZodiac = await calculateZodiac(req.session.accessToken);
          req.session.user.zodiac = userZodiac;

          // db.task(`UPDATE users SET zodiac = ${userZodiac} WHERE username = ${req.session.user.username};`);
        }
        zodiacDescription = await db.one(dbRetrieveZodiacDescription(userZodiac));
      } catch (err) {
        // Handle errors
        console.error('Error:', err);
        // Set default values or handle errors as needed
        userZodiac = 'Default Zodiac';
        zodiacDescription = 'Default Description';
      }

      // Define image paths for each sign
      const zodiacImagePaths = {
        "Aquarius": "../../resources/img/zodiac/Aquarius.png",
        "Aries": "../../resources/img/zodiac/Aries.png",
        "Cancer": "../../resources/img/zodiac/Cancer.png",
        "Capricorn": "../../resources/img/zodiac/Capricorn.png",
        "Gemini": "../../resources/img/zodiac/Gemini.png",
        "Leo": "../../resources/img/zodiac/Leo.png",
        "Libra": "../../resources/img/zodiac/Libra.png",
        "Pisces": "../../resources/img/zodiac/Pisces.png",
        "Sagittarius": "../../resources/img/zodiac/Sagittarius.png",
        "Scorpio": "../../resources/img/zodiac/Scorpio.png",
        "Taurus": "../../resources/img/zodiac/Taurus.png",
        "Virgo": "../../resources/img/zodiac/Virgo.png",
      };

      const publicZodiacImagePaths = {
        "Aquarius": "https://drive.google.com/file/d/1U49kn-hZ2iJmmfDJxnjGbs3uYuhbi4EK/view?usp=drive_link",
        "Aries": "https://drive.google.com/file/d/1052kx_XChizl-vli0zUHkphv0DkSDyQX/view?usp=drive_link",
        "Cancer": "https://drive.google.com/file/d/1xeGZYKQgRV4fuIGrMmiuC1EehJqnk5cV/view?usp=drive_link",
        "Capricorn": "https://drive.google.com/file/d/13Txt_H2iu03x4L5GmIqii7PPrSE5iozr/view?usp=drive_link",
        "Gemini": "https://drive.google.com/file/d/1CdG-oCKfLHSeRKevHwLsM9JVtvDoeJF-/view?usp=drive_link",
        "Leo": "https://drive.google.com/file/d/1R3x6I8BK3gEaqtDbGfoEXfytpGQIkIS7/view?usp=drive_link",
        "Libra": "https://drive.google.com/file/d/1MXTr-OFMfyq5ef5QGNtFnoRgNAZWnsoU/view?usp=drive_link",
        "Pisces": "https://drive.google.com/file/d/1kFtCxtLzgfX23GmGfbhiJJYgMjXFvFaP/view?usp=drive_link",
        "Sagittarius": "https://drive.google.com/file/d/1PZRydzqM9XWte0JrhnEovNcHngJ4aatc/view?usp=drive_link",
        "Scorpio": "https://drive.google.com/file/d/1DcdUVvU-C9P_52hhvsg1fn968l8jeBLk/view?usp=drive_link",
        "Taurus": "https://drive.google.com/file/d/19I9FE4V7FZkBAp-XkQjE-Cwc-gxwGydp/view?usp=drive_link",
        "Virgo": "https://drive.google.com/file/d/1Y8Z4XUI2Qiso7AQBO7jR6GZZrsBGwmBK/view?usp=drive_link",
      };

      // Render the 'home' view with the user's data
      res.render('home', { 
        user: req.session.user,
        zodiac: userZodiac,
        zodiacDescription: zodiacDescription.desc, // Use the retrieved description
        zodiacImagePath: zodiacImagePaths[userZodiac], // Pass the image path for the user's zodiac sign
        publicZodiacImagePath:publicZodiacImagePaths[userZodiac]
      });
    } else {
      // If logged into website but not Spotify, redirect to /homeNotLinkedToSpotify
      res.redirect('/homeNotLinkedToSpotify');
    }
  } else {
    // If user is not logged into website, redirect to /about
    res.redirect('/about');
  }
});

app.get('/homeNotLinkedToSpotify', (req, res) => {
  if (req.session.user) {
    res.render("homeNotLinkedToSpotify", {
      user: req.session.user
    });
  } else {
    // Redirect to about page if user is not logged in
    res.redirect("/about");
  }
});

app.get('/about', (req, res) => {
  res.render("about", {
    user: req.session.user
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/home");
});



// Spotify API Interactions
// Authentication
app.get('/loginwithspotify', (req, res) => {
  try {
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.CLIENT_ID,
      scope: "playlist-read-private playlist-read-collaborative user-top-read user-library-read",
      redirect_uri: redirectURI
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

    req.session.accessToken = response.data.access_token;
    req.session.save();
    res.redirect("/home")
  } catch (err) { // Redirect to home if API call doesn't return something correctly or something like that
    console.log(err);
    res.redirect("/");
  } 
});

// Helper Functions for /getTop5Tracks
async function fetchWebApi(accessToken, endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();
}

async function getTopArtists(accessToken, url) {
  return (await fetchWebApi(accessToken, url, 'GET')).items;
}

async function getTop5Tracks(accessToken) {
  const num = 50;
  let genreArr = [];
  let topArtists = (await getTopArtists(accessToken, `v1/me/top/artists?time_range=long_term&limit=${num}`));
  for(let i = 0; i < num; i++) {
    if(!topArtists[i]) {
      break;
    }
    topArtists[i].genres.forEach(genre => {
      if(genre) {
        genreArr.push(genre)
      }
    })
  }
  genreArr = parsingData(genreArr)
  console.log(genreArr)
  return genreArr.reduce(function (value, value2) {
    return (
        value[value2] ? ++value[value2] :(value[value2] = 1),
        value
    );
  }, {});
}

async function calculateZodiac(accessToken) {
  // Initialize scores
  let zodiacScores = {
    "Capricorn": 0,
    "Aquarius": 0,
    "Pisces": 0,
    "Aries": 0,
    "Taurus": 0,
    "Gemini": 0,
    "Cancer": 0,
    "Leo": 0,
    "Virgo": 0,
    "Libra": 0,
    "Scorpio": 0,
    "Sagittarius": 0
  }

  // Tally up scores for each zodiac (top zodiac gets 2 points, second gets 1 point)
  const genres = await getTop5Tracks(accessToken);
  for (const genre in genres) {
    const correspondingZodiacs = await db.any(dbRetrieveGenreZodiacs(genre));
    if (correspondingZodiacs.length > 0) {
      // There exists zodiac data for the genre
      zodiacScores[correspondingZodiacs[0].zodiac] += 2;
      zodiacScores[correspondingZodiacs[1].zodiac] += 1;
    }
  }

  // Tie breaker (random number generator)
  // Get largest score
  let greatestScore = 0;
  for (let zodiac in zodiacScores) {
    if (zodiacScores[zodiac] > greatestScore) {
      greatestScore = zodiacScores[zodiac];
    }
  }
  
  // Get array of zodiacs with the highest score
  let greatestScoreZodiacs = [];
  for (let zodiac in zodiacScores) {
    if (zodiacScores[zodiac] == greatestScore) {
      greatestScoreZodiacs.push(zodiac);
    }
  }

  let zodiacCount = greatestScoreZodiacs.length;
  return greatestScoreZodiacs[getRandomInt(0, zodiacCount)];
}

function parsingData(input) {
  genres = ["hip hop rap", "pop", "country", "rock", "edm", "indie", "jazz", "classical", "r&b", "punk", "alternative", "folk", "tv & film", "chill", "trending", "soul", "ambient", "love", "metal", "instrumental"];
  hip = ["hip", "hop", "rap"]
  toRet = []
  input.forEach(g=> {
    parseArr = g.split(" ").join(",").split("-")
    parseArr.forEach(p=> {
      if(hip.includes(p)) {
        toRet.push("hip hop rap")
      } else if(genres.includes(p)) {
        toRet.push(p)
      }
    })
  })
  return toRet;
}

// Helper function (from MDN web docs)
function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function dbRetrieveZodiacDescription(zodiacName) {
  return `SELECT z.description AS desc FROM zodiacs z WHERE z.zodiac = '${zodiacName}';`;
}

// Adjust the path to the views directory
app.set('views', path.join(__dirname, 'views', 'pages'));

// open on port 3000

module.exports = app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});

