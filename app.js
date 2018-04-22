require('dotenv').config();

var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    cookieParser   = require("cookie-parser"),
    Picture        = require("./models/picture");
    
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
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require("cloudinary");
cloudinary.config({ 
  cloud_name: "davidandkristle", 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

mongoose.connect("mongodb://localhost/wedding_pics");    
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res){
    Picture.find({}, function(err, allPictures) {
        if(err) {
            console.log(err);
        } else {
            res.render("landing", {pictures: allPictures});     
        }
    });
});

app.get("/new", function(req, res){
   res.render("new"); 
});

app.post("/", upload.single("image"), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        var image = req.body.image;
        image = result.secure_url;
        var newPicture = {image: image}
        Picture.create(newPicture, function(err, picture) {
        if (err) { 
            console.log(err);
        }
        res.redirect("/");
        });
    });
});

app.listen(process.env.PORT, process.env.IP, function() {
   console.log("The Wedding server has started!"); 
});