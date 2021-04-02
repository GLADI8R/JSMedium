const port = 3000;
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const homeContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

mongoose.connect("mongodb://localhost:27017/JSMedDB", {
   useUnifiedTopology: true, 
   useNewUrlParser: true
});

const blogSchema = new mongoose.Schema({
   title: String,
   body: String
});

const userSchema = new mongoose.Schema({
   email: String,
   password: String
});

blogSchema.index({
   "title": "text" 
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] }); 

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

app.get("/signUp", (req, res) => {
   res.render("SignUp");
});

app.post("/register", (req, res) => {
   const user = new User({
      email: req.body.email,
      password: req.body.password
   });

   user.save((err) => {
      if(err){
         console.log("Error:", error);
      } else {
         res.redirect("/home");
      }
   })
});

app.post("/login", (req, res) => {
   const email = req.body.email;
   const password = req.body.password;

   User.findOne({email: email}, (err, user) => {
      if(err){
         console.log("Error:", err);
      } else {
         if(user) {
            if(user.password === password){
               res.redirect("/home");
            }
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
