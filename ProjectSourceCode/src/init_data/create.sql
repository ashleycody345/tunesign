DROP TABLE IF EXISTS zodiacs;
CREATE TABLE zodiacs
(
    zodiac VARCHAR(20) PRIMARY KEY,
    description TEXT
);

DROP TABLE IF EXISTS users;
CREATE TABLE users
(
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(60) NOT NULL,
    zodiac VARCHAR(20) REFERENCES zodiacs(zodiac)
);

DROP TABLE IF EXISTS genres;
CREATE TABLE genres
(
    genreName VARCHAR(50) PRIMARY KEY,
    topzodiac VARCHAR(20) REFERENCES zodiacs(zodiac),
    secondzodiac VARCHAR(20) REFERENCES zodiacs(zodiac)
);

DROP TABLE IF EXISTS users_to_genres;
CREATE TABLE users_to_genres
(
    username VARCHAR(50) REFERENCES users(username),
    genreName VARCHAR(50) REFERENCES genres(genreName),
    usergenrescore int NOT NULL,
    PRIMARY KEY (username, genreName)
);