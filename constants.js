const express = require('express');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const {
  findUserByEmail,
  generateRandomString
} = require('./helpers');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    visits: 0
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "99ohwc99",
    visits: 0
  }
};

const users = {
  "99ohwc99": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "55widc55": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

module.exports = {
  methodOverride,
  cookieSession,
  bcrypt,
  app,
  PORT,
  bodyParser,
  urlDatabase,
  users,
  findUserByEmail,
  generateRandomString
};