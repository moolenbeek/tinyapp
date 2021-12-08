// constants
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { json } = require('body-parser');
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
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
  if (!userId) {
    res.redirect('/urls')
    return;
  }
  res.render("urls_new", {user: users[userId]});
});

// render urls_index
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const userUrlDatabase = {}

  for (const x in urlDatabase) {
    if (userId === urlDatabase[x].userID) {
      userUrlDatabase[x] = {
        longURL: urlDatabase[x].longURL,
        userID: userId
      }
    }
  }

  const templateVars = { 
    urls: userUrlDatabase,
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

// url redirect
app.get("/u/:shortURL", (req, res) => {
  for (const x in urlDatabase) {
    if (x === req.params.shortURL) {
      res.redirect(urlDatabase[x].longURL);
      return;
    }
  }
  res.status(404).send('Error 404: url doesn\'t exist');
});

// receive info from register form
app.post('/register', (req, res) => {
  let userId = Math.random().toString(36).substr(2, 8);
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

  if (user) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
    return;
  }
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
  urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies.user_id
  }; 
  res.redirect(`/urls/${shortURL}`);
});

// delete existing url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID === req.cookies.user_id) {
    delete urlDatabase[shortURL];
  }
  res.redirect(`/urls`);
});

// update existing url
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (urlDatabase[shortURL].userID === req.cookies.user_id) {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies.user_id
    }; 
  }
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
  const user = findUserByEmail(email, db);
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