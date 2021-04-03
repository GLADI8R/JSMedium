const port = 3000;
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

const homeContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

mongoose.connect("mongodb://localhost:27017/JSMedDB", {
   useUnifiedTopology: true, 
   useNewUrlParser: true
});
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const blogSchema = new Schema({
   title: String,
   body: String
});

const userSchema = new Schema({
   email: String,
   password: String
});

blogSchema.index({
   "title": "text" 
});

const Article = mongoose.model("Article", blogSchema);
const User = mongoose.model("User", userSchema);
let searchedFor = "";

Article.createIndexes();

app.get("/", (req, res) =>{
   res.render("JSMed");
});

app.get("/home", (req, res) => {
   Article.find({}, function(err, articles){
      res.render("Home", {homeContent: homeContent, articles: articles});
   });
});

app.get("/about", (req, res) => {
   res.render("About");
});

app.get("/login", (req, res) => {
   res.render("Login");
});

app.get("/register", (req, res) => {
   res.render("SignUp");
});

app.post("/register", (req, res) => {
   bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      const user = new User({
         email: req.body.email,
         password: hash
      });

      user.save((err) => {
         if(err){
            console.log(err);
         } else {
            res.redirect("/home");
         }
      });
   });
});

app.post("/login", (req, response) => {
   const email = req.body.email;
   const password = req.body.password;

   User.findOne({email: email}, (err, user) => {
      if(err){
         console.log("Error:", err);
      } else {
         if(user) {
            bcrypt.compare(password, user.password, (err, res) => {
               if(err){
                  console.log(err);
               } else {
                  response.redirect("/home");
               }
            });
         }
      }
   });
});

app.get("/search", (req, res) => {
   Article.find({title: {$regex: searchedFor, $options: "i"}}, (err, articles) => {
      if(err) {
         console.log("Error:", error);
      } else {
         res.render("Search", {articles: articles});
      }
   });
});

app.post("/search", (req, res) => {
   searchedFor = req.body.artFind;
   res.redirect("/search");
});

app.get("/compose", (req, res) => {
   res.render("Compose");
});

app.post("/compose", (req, res) => {
   const article = new Article({
      title: req.body.artTitle,
      body: req.body.artBody
   });

   article.save((err) => {
      if(!err){
         res.redirect("/");
      }
   });
});

app.listen(port, () => {
   console.log("Server started on Port", port);
});