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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
  let templateVars = {
    urls : urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  let templateVars = { shortURL: shortURL, longURL: longURL,
      urls : urlDatabase,
      username: req.cookies["username"]
    };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  var a = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[a] = req.body.longURL;
  console.log("http://localhost:8080/urls/" + a);
  res.redirect("http://localhost:8080/urls/" + a);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let userName = req.body.username;
  res.cookie("username", userName);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  let userName = req.body.username;
  res.clearCookie("username", userName);
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
    return res.status(404).send("Oh uh, something went wrong");
  } else if (newUserPassword === "") {
    return res.status(404).send("Oh uh, something went wrong");
  } else {
    newUser = {"id":randomID , "email": newUserEmail, "password": newUserPassword};
  }
  users[randomID] = newUser;
  for (id in users) {
    if(users[id]["email"] === newUserEmail) {
      return res.status(404).send("Oh uh, something went wrong");
    }
  }
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
