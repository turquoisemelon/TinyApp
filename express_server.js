var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const morgan = require('morgan');

app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
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

const users = {
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
  console.log(req.cookies);
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = users[user_id];

  let urlObjs = {};
  for (let urlKey in urlDatabase) {
    urlObjs[urlKey] = {
      shortUrl: urlDatabase[urlKey].shortURL,
      longURL: urlDatabase[urlKey].longURL,
      userId: urlDatabase[urlKey].userId,
      ownedByCurrentUser: user_id == urlDatabase[urlKey].userId
    }
  }

  let templateVars = {
    urls : urlObjs,
    user: user
  };
  console.log(req.cookies);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = users[user_id];
  let templateVars = {
    user: user
  };
  if (req.cookies["user_id"] in users) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let getUserId = req.cookies["user_id"];
  let getShortUrl = urlDatabase[req.params.id]["shortURL"];
  let getLongURL = urlDatabase[req.params.id]["longURL"];
  let user = users[getUserId];
  let templateVars = {
    "shortURL": getShortUrl,
    "longURL": getLongURL,
    "user": user
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  var a = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[a] = {
    shortURL: a,
    longURL:req.body.longURL,
    userId: req.cookies["user_id"]};
  console.log(urlDatabase);
  res.redirect("http://localhost:8080/urls/" + a);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]["shortURL"];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id]["userId"] === req.cookies["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    return res.status(400).send("Something went wrong")
  }
});

app.get("/login", (req, res) => {
  res.render("urls_login")
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  for (key in users) {
    if(users[key]["email"] === userEmail) {
      if(users[key]["password"] === userPassword) {
        res.cookie("user_id", key);
        return res.redirect("/");
      }
    }
  }
    return res.status(403).send("Username or password is not correct");
  // console.log(user_id)
  // if (neverFoundUser) {
  // }
});

app.post("/logout", (req, res) => {
  let user_id = req.body["user_id"];
  res.clearCookie("user_id", user_id);
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("urls_register")
});

app.post("/register", (req, res) => {
  let randomID = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  let newUser = {};
  let newUserEmail = req.body.email;
  let newUserPassword = req.body.password;
  if(newUserEmail === "") {
    return res.status(400).send("Oh uh, something went wrong");
  } else if (newUserPassword === "") {
    return res.status(400).send("Oh uh, something went wrong");
  } else {
    newUser = {"id":randomID , "email": newUserEmail, "password": newUserPassword};
  }
  for (id in users) {
    if(users[id]["email"] === newUserEmail) {
      return res.status(400).send("User already exists");
    }
  }
  users[randomID] = newUser;
  console.log('REGISTERED ID', randomID);
  console.log('USERS', users);
  res.cookie("user_id", randomID);
  res.redirect("/");
});

function generateRandomString(length, chars) {
  var result = "";
  for (var i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
 return result;
}
