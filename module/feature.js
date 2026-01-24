const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const Feature = mongoose.model("Feature", featureSchema);

module.exports = Feature;
