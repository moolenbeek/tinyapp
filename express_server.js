<<<<<<< HEAD
// constants
const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const { findUserByEmail, generateRandomString } = require('./helpers');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "99ohwc99"
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
=======
const {
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
} = require('./constants');
>>>>>>> feature/method-override

// server setup
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));
app.set('trust proxy', 1); // trust first proxy
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// render urls_new page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect('/urls');
    return;
  }
  res.render("urls_new", {
    user: users[userId]
  });
});

// render urls_index
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const userUrlDatabase = {};
  const db = urlDatabase;

  for (const url in db) {
    if (userId === db[url].userID) {
      userUrlDatabase[url] = {
        longURL: db[url].longURL,
        userID: userId
      };
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
  const userId = req.session.user_id;
  const shortUrl = req.params.shortURL;

  const templateVars = {
    shortURL: shortUrl,
    longURL: urlDatabase[shortUrl],
    user: users[userId],
    visits: urlDatabase[shortUrl].visits
  };
  res.render("urls_show", templateVars);
});

// render register
app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  res.render('register', {
    user: users[userId]
  });
});

// render login
app.get('/login', (req, res) => {
  const userId = req.session.user_id;
<<<<<<< HEAD
  res.render('login', {user: users[userId]});
=======
  res.render('login', {
    user: users[userId]
  });
>>>>>>> feature/method-override
});

// url redirect
app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  urlDatabase[shortUrl].visits++;
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
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);
  let userId = Math.random().toString(36).substr(2, 8);
  if (user) {
    res.status(403).send('User already exists!');
    return;
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      users[userId] = {
        id: userId,
        email: email,
        password: hash
      };
      req.session.user_id = userId;
      res.redirect('/urls');
    });
  });
});

// receive info from login form
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);

  bcrypt.compare(password, user.password, (err, response) => {
    // res == true or res == false
    if (response) {
      req.session.user_id = user.id;
      res.redirect('/urls');
      return;
    }
    res.status(401).send('wrong credentials!');
  });

});

// handle logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// create new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
<<<<<<< HEAD
    userID: req.session.user_id
=======
    userID: req.session.user_id,
    visits: 0
>>>>>>> feature/method-override
  };
  res.redirect(`/urls/${shortURL}`);
});

// delete existing url
app.delete("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID === req.session.user_id) {
    delete urlDatabase[shortURL];
  }
  res.redirect(`/urls`);
});

// update existing url
app.put("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (urlDatabase[shortURL].userID === req.session.user_id) {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
  }
  res.redirect(`/urls/${shortURL}`);
});