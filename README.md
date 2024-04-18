# TuneSign
## Description
TuneSign utilizes the Spotify API to allow users to sign in using their Spotify account and analyzes their data regarding their listening history, including their most listened to genres.

## Contributors
* Jasper Shen
* Benedict Antonious
* Ashley Cody
* Langston Denning
* Lachlan Kotarski

## Technology Stack
Built with Spotify API, PostgreSQL, Handlebars, NodeJS.

## Prerequisites to Run TuneSign
No prerequisites or dependencies need to be installed locally. A separate Spotify account is required for most features.

## Instructions to run locally:
After downloading the source code, run Docker Compose in the /ProjectSourceCode folder after creating an appropriate .env file:
```
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="pwd"
POSTGRES_DB="tunesign_db"

SESSION_SECRET="secret"

CLIENT_ID = "80cb40fc4c6f4cc9a7dd6ad33d600cbd"
CLIENT_SECRET = "027cd8c76fc947e7bc7c859b0e8f0b0c"
```
Alternatively, navigate to the link below for our hosted website.

## How to run tests:
Tests will run automatically upon starting the Docker container. 

## Deployed application:
http://recitation-14-team-03.eastus.cloudapp.azure.com:3000/about