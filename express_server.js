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

app.get("/", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    res.redirect('/register');
    return;
  } else {
    res.redirect('/urls')
  }
    
});

// render urls_new page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect('/login');
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

  // redirect to login if no user logged in
  if (!userId) {
    res.status(401).send('Error 401 : must be logged in to view urls');
    return;
  }

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

    // redirect to login if no user logged in
    if (!userId) {
      res.status(401).send('Error 401 : must be logged in to view urls');
      return;
    }

    // if user is logged in and doesn't own url give error message
    if (userId !== urlDatabase[shortUrl].userID) {
      res.status(401).send('Error 401 : you do not own this url');
      return;
    }
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
  res.render('login', {
    user: users[userId]
  });
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

  // show error message if email or password is blank
  if (!email || !password) {
    res.status(401).send('email and password cannot be blank');
    return;
  }

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
  const userId = req.session.user_id;
  const shortURL = generateRandomString();

  if (userId) {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userId,
      visits: 0
    };
    res.redirect(`/urls/${shortURL}`);
    return;
  } else {
    res.status(401).send('error 401: must be logged in to create urls');
    return;
  }

  
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

app.set("view engine", "ejs");
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});