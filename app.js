const port = 3000;
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

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

blogSchema.index({
   "title": "text"
});

const Article = mongoose.model("Article", blogSchema);
let searchedFor = "";

Article.createIndexes();

app.get("/", (req, res) => {
   Article.find({}, function(err, articles){
      res.render("Home", {homeContent: homeContent, articles: articles});
   });
});

app.get("/about", (req, res) => {
   res.render("About");
});

app.get("/contact", (req, res) => {
   res.render("Contact");
});

app.get("/search", (req, res) => {
   const query = {$text: {$search: searchedFor}};
   const sort = { score: { $meta: "textScore" } };
   const projection = {
      _id: 0,
      title: 1,
      body: 1
   };
   //console.log(query);
   const cursor = Article.find(query);
   //console.log(cursor);
   cursor.exec( (err, article) => {
      console.log(article.title);
      //res.render("Search", {Title: article.title, Body: article.body});
   });

   //Article.findOne({title: searchedFor}, (err, article) => {
   //   if(err) {
   //      console.log("Error:", error);
   //   } else {
   //      res.render("Search", {Title: article.title, Body: article.body});
   //   }
   //});
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
