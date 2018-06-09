require('dotenv').config();

var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    Picture        = require("./models/picture"),
    favicon        = require("serve-favicon"),
    path           = require("path");
    
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require("cloudinary");
cloudinary.config({ 
  cloud_name: "davidandkristle", 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

var url = process.env.DATABASEURL || "mongodb://localhost/wedding_pics";
mongoose.connect(url); 

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(favicon(path.join(__dirname, "/public", "favicon.ico")));

app.get("/", function(req, res){
   res.render("index"); 
});

app.get("/landing", function(req, res){
    var perPage = 39;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    Picture.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allPictures) {
        if(err) {
            console.log(err);
        }
        Picture.count().exec(function (err, count) {
            if(err) {
                console.log(err);
            } else {
                res.render("landing", {
                    pictures: allPictures,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage)
                });     
            }
        });
    });
});

app.get("/new", function(req, res){
   res.render("new"); 
});

app.post("/landing", upload.single("image"), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        var image = req.body.image;
        image = result.secure_url;
        var anchor = image;
        var newPicture = {image: image, anchor: image};
        Picture.create(newPicture, function(err, picture) {
        if (err) { 
            console.log(err);
        }
        res.redirect("/landing");
        });
    });
});

app.listen(process.env.PORT, process.env.IP, function() {
   console.log("The Wedding server has started!"); 
});