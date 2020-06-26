var mysql = require("mysql");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var validEmail = true;
var validFname = true;
var validLname = true;

app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static(__dirname + "/public/"));

// connect to hosted SQL Database
var con = mysql.createPool({
  host: //hidden,
  user: //hidden,
  password: //hidden,
  database: //hideen,
});

// homepage
app.get("/", function (req, res) {
  // Find count of users in DB
  var q = "SELECT COUNT(*) AS count FROM users";
  con.query(q, function (err, results) {
    if (err) throw err;
    console.log(results);
    var count = results[0].count;
    var last =
      "SELECT DATE_FORMAT(created_at, '%m/%d/%Y at %h:%i%p') AS registered from users ORDER BY created_at DESC LIMIT 1;";
    con.query(last, function (err, results) {
      if (err) throw err;
      var lastCreated = results[0].registered;
      console.log(lastCreated);
      res.render("homepage", {
        count: count,
        lastCreated: lastCreated,
        validEmail: validEmail,
        validFname: validFname,
        validLname: validLname,
      });
    });
  });
});

// checks for an invalid email
function badEmail(email) {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!regEx.test(email.trim())) {
    return true;
  }
  return false;
}

// checks if no name is given
function badName(name) {
  if (name.trim() === "") {
    return true;
  }
  return false;
}

// add the user to the database or ask user for missing info
app.post("/register", function (req, res) {
  console.log(req.body);

  if (badEmail(req.body.email)) {
    console.log("failed");
    validEmail = false;
  } else {
    validEmail = true;
  }
  if (badName(req.body.first)) {
    console.log("failed");
    validFname = false;
  } else {
    validFname = true;
  }
  if (badName(req.body.last)) {
    console.log("failed");
    validLname = false;
  } else {
    validLname = true;
  }



  // if the form failed pull up failure page
  if (
    badEmail(req.body.email) ||
    badName(req.body.first) ||
    badName(req.body.last)
  ) {

    var q = "SELECT COUNT(*) AS count FROM users";
    con.query(q, function (err, results) {
      if (err) throw err;
      console.log(results);
      var count = results[0].count;
      var last =
        "SELECT DATE_FORMAT(created_at, '%m/%d/%Y at %h:%i%p') AS registered from users ORDER BY created_at DESC LIMIT 1;";
      con.query(last, function (err, results) {
        if (err) throw err;
        var lastCreated = results[0].registered;
        res.render("failure", {
          count: count,
          lastCreated: lastCreated,
          validEmail: validEmail,
          validFname: validFname,
          validLname: validLname,
        });
      });
    });
    return;
  }

  validEmail = true;
  validFname = true;
  validLname = true;
  var person = {
    email: req.body.email,
    first: req.body.first,
    last: req.body.last,
  };

  // if all tests are passed enter the user into the database
  con.query("INSERT INTO users SET ?", person, function (err, result) {
    if (err) throw err;
    res.redirect("/");
  });
});

// need for heroku or run on my local environment
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started successfully!");
});
