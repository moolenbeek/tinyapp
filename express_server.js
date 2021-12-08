// constants
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { json } = require('body-parser');
const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
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
}

// server setup
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// render urls_new page
app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  res.render("urls_new", {user: users[userId]});
});

// render urls_index
app.get("/urls", (req, res) => {

  const userId = req.cookies['user_id'];

  const templateVars = { 
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("urls_index", templateVars);
});

// render urls_show
app.get("/urls/:shortURL", (req, res) => {

  const userId = req.cookies['user_id'];

  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[userId]
  };
  res.render("urls_show", templateVars);
});

// render register
app.get('/register', (req, res) => {
  const userId = req.cookies['user_id'];
  res.render('register', {user: users[userId]});
});

// render login
app.get('/login', (req, res) => {
  const userId = req.cookies['user_id'];
 res.render('login', {user: users[userId]});
});

// receive info from register form
app.post('/register', (req, res) => {
  const userId = Math.random().toString(36).substr(2, 8);
  const email = req.body.email;
  const password = req.body.password;

  const user = findUserByEmail(email, users);

  if (user) {
    res.status(403).send('User already exists!');
    return;
  }

  users[userId] = {
    id: userId, 
    email: email,
    password: password 
  }

  res.cookie('user_id', userId);
  res.redirect('/urls');
});

// receive info from login form
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = authenticateUser(email, password, users);
  console.log({user});

  if (user) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
    return;
  }
  // user is not authenticated
  res.status(401).send('wrong credentials!');
});

// handle logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});





// create new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; 
  console.log('adding new url');
  res.redirect(`/urls/${shortURL}`);
});

// url redirect
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

// delete existing url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

// update existing url
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  console.log('updating url');
  res.redirect(`/urls/${shortURL}`);
});

// generate random tinyURL for new urls
const generateRandomString = () => {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

// find user in db
const findUserByEmail = (email, db) => {
  for (let userId in db) {
    const user = db[userId]; // => retrieve the value

    if (user.email === email) {
      return user;
    }
  }

  return false;
};

// authenticate user
const authenticateUser = (email, password, db) => {

  console.log({email,password})

  const user = findUserByEmail(email, db);

  console.log({user});

  if (user && user.password === password) {
    return user;
  }

  return false;
};

// Non relevant code
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});