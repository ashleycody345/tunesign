# TuneSign
## Description
TuneSign utilizes the Spotify API to allow users to sign in using their Spotify account and analyzes their data regarding their listening history, including their most listened to genres.


## Technology Stack
Built with Spotify API, PostgreSQL, Handlebars, NodeJS.

## Prerequisites to Run TuneSign
* You have a **Windows/Linux/Mac** machine.
* You have installed the latest version of **Docker**.
* You have a Spotify Developer account with an app.
* You have a Spotify account with a listening history.

## Instructions to Run Locally:
After downloading the source code, run Docker Compose in the /ProjectSourceCode folder after creating an appropriate .env file:
```
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="pwd"
POSTGRES_DB="tunesign_db"

SESSION_SECRET="secret"

CLIENT_ID = "<Your Spotify Dev App Client ID>"
CLIENT_SECRET = "<Your Spotify Dev App Client Secret>"
```
Fill out the CLIENT_ID and CLIENT_SECRET using the your own Spotify Developer App details.
Alternatively, navigate to the link below for our hosted website.

## How to Run Tests:
Tests will run automatically upon starting the Docker container. 

## Deployed Application:
[TuneSign](http://recitation-14-team-03.eastus.cloudapp.azure.com:3000/about)

## Contributors
* Jasper Shen
* Benedict Antonious
* Ashley Cody
* Langston Denning
* Lachlan Kotarski
