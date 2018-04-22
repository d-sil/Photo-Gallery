var mongoose = require("mongoose");

var PictureSchema = new mongoose.Schema({
    image: String,
});

module.exports = mongoose.model("Picture", PictureSchema);