const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = process.env.PORT || 3000; // default port 8080
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");


app.set("view engine", "ejs");
app.use(morgan('dev'));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  key: ['key1', 'key2 '],
  secret: 'first secret',
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userId: "apple"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userId: "banana"
  }
};

let users = {
  "apple": {
    id: "apple",
    email: "apple@example.com",
    password: "purple-monkey-dinosaur"
  },
 "banana": {
    id: "banana",
    email: "banana@example.com",
    password: "dishwasher-funk"
  }
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  let user_id = req.session["user_id"];
  let user = users[user_id];
  if (req.session["user_id"] in users) {
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  // let user_id = req.cookies["user_id"];
  let user_id = req.session["user_id"];
  console.log(req.session)
  console.log(req.session["user_id"]);
  let user = users[user_id];

  // if (req.cookies["user_id"] in users) {
  if (req.session["user_id"] in users) {
    let templateVars = {
      // urls: urlsForUser(req.cookies["user_id"]),
      urls: urlsForUser(req.session["user_id"]),
      user: user
    };
    res.render("urls_index", templateVars);
    res.status(200);
  } else {
    res.render("error", res.status(401));
  }
});

app.post("/urls", (req, res) => {
  let id = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[id] = {
    shortURL: id,
    longURL:req.body.longURL,
    userId: req.session["user_id"]};
    if (req.session["user_id"] in users) {
      res.redirect("http://localhost:3000/urls/" + id);
    } else {
      res.render("error", res.status(401));
    }
});

function urlsForUser(id) {
  let filteredObj = {};
  for (let urlKey in urlDatabase) {
    if(id === urlDatabase[urlKey].userId) {
      filteredObj[urlKey] = {
        shortUrl: urlDatabase[urlKey].shortURL,
        longURL: urlDatabase[urlKey].longURL,
        userId: urlDatabase[urlKey].userId,
        ownedByCurrentUser: id == urlDatabase[urlKey].userId
      }
    }
  }
  return filteredObj;
}

app.get("/urls/new", (req, res) => {
  // let user_id = req.cookies["user_id"];
  let user_id = req.session["user_id"];
  let user = users[user_id];
  let templateVars = {
    user: user
  };
  // if (req.cookies["user_id"] in users) {
  if (req.session["user_id"] in users) {
    res.render("urls_new", templateVars);
  } else {
    res.render("error", res.status(401));
  }
});
localhost/urls/dsalfkj
req.params.id

app.get("/urls/:id/cool/:tag")

localhost/urls/:id/cool/:tag
req.params.id = ':id'
req.params.tag = ':tag'


localhost/urls/6hdkxy/cool/fancy
req.params.id = '6hdkxy'
req.params.id = 'fancy'

app.get("/urls/:id", (req, res) => {
  // let getUserId = req.cookies["user_id"];
  let getUserId = req.session["user_id"];
  // TODO: CHeck that a hort url exists
  let getShortURL = urlDatabase[req.params.id]["shortURL"];
  let getLongURL = urlDatabase[req.params.id]["longURL"];

  let user = users[getUserId];
  let templateVars = {
    "shortURL": getShortURL,
    "longURL": getLongURL,
    "user": user
  };
  if (req.session["user_id"] in users === false) {
    res.render("error", res.status(401));
  } else if (req.session["user_id"] in users === true && req.session["user_id"] !== urlDatabase[req.params.id]["userId"]) {
    res.render("error", res.status(403));
  } else if (req.params.id !== getShortURL) {
    res.status(401).render("error", {});

  } else {
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  req.params.id = req.body["longURL"];
  res.redirect(`/urls/${req.params.id}`);
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params);
  console.log(req.params.shortURL);
  console.log(urlDatabase);
  console.log(urlDatabase[req.params.shortURL]);
  let longURL = urlDatabase[req.params.shortURL]["longURL"]
  if(longURL === urlDatabase[req.params.shortURL]["longURL"]) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Something went wrong");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  // if (urlDatabase[req.params.id]["userId"] === req.cookies["user_id"]) {
  if (urlDatabase[req.params.id]["userId"] === req.session["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(400).send("Something went wrong");
  }
});

app.get("/login", (req, res) => {
  if (req.session["user_id"] in users) {
    res.redirect("/");
  } else {
    res.render("urls_login", res.status(200));
  }
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  for (var key in users) {
    if(users[key]["email"] === userEmail) {
      console.log(userPassword);
      console.log(users[key]["password"]);
      if(bcrypt.compareSync(userPassword, users[key]["password"]) === true) {
        // res.cookie("user_id", key);
        req.session["user_id"] = key;
        res.redirect("/");
      }
    }
  }
    res.status(403).send("Username or password is not correct");
});

app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("urls_register")
});

app.post("/register", (req, res) => {
  let randomID = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  let newUser = {};
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  const newUserHashedPassword = bcrypt.hashSync(newUserPassword, 10);
  if(newUserEmail === "") {
    res.status(400).send("Oh uh, something went wrong");
  } else if (newUserPassword === "") {
    res.status(400).send("Oh uh, something went wrong");
  } else {
    newUser = {"id":randomID , "email": newUserEmail, "password": newUserHashedPassword};
  }
  for (id in users) {
    if(users[id]["email"] === newUserEmail) {
      res.status(400).send("User already exists");
    }
  }
  users[randomID] = newUser;
  console.log(users);
  // res.cookie("user_id", randomID);
  req.session["user_id"] = randomID;
  res.redirect("/");
});

function generateRandomString(length, chars) {
  let result = "";
  for (var i = length; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
 return result;
}
