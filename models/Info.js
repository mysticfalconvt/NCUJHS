const mongoose = require("mongoose");
const { stringify } = require("uuid");
mongoose.Promise = global.Promise;

const infoSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply a creator!",
  },
  title: {
    type: String,
    required: "You must have an event title!",
  },
  description: {
    type: String,
  },
  link: {
    type: String,
  },
  linkTitle: {
    type: String,
  },
  teachersOnly: {
    type: String,
    default: "true",
  },
  category: {
    type: String,
    default: "General Info",
  },
  deleted: {
    type: String,
    default: "",
  },
});

function autopopulate(next) {
  this.populate("author");
  next();
}

infoSchema.pre("find", autopopulate);
infoSchema.pre("findOne", autopopulate);

infoSchema.index({
  title: "text",
  description: "text",
});

module.exports = mongoose.model("Info", infoSchema);
