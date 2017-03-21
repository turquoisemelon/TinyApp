const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
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
    res.redirect("/login");
  }
});
  // res.end("Hello!");

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
  } else {
    res.status(400).send("Please login or register first");
  }
});

app.post("/urls", (req, res) => {
  let id = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[id] = {
    shortURL: id,
    longURL:req.body.longURL,
    // userId: req.cookies["user_id"]};
    userId: req.session["user_id"]};
  res.redirect("http://localhost:8080/urls/" + id);
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
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  // let getUserId = req.cookies["user_id"];
  let getUserId = req.session["user_id"];
  let getShortURL = urlDatabase[req.params.id]["shortURL"];
  let getLongURL = urlDatabase[req.params.id]["longURL"];
  let user = users[getUserId];
  let templateVars = {
    "shortURL": getShortURL,
    "longURL": getLongURL,
    "user": user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params);
  console.log(req.params.shortURL);
  console.log(urlDatabase);
  console.log(urlDatabase[req.params.shortURL]);
  let longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
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
  res.render("urls_login")
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
