const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const calendarSchema = new mongoose.Schema({
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
  Date: {
    type: Date,
    required: "You must have a date!",
  },
});

function autopopulate(next) {
  this.populate("author");
  next();
}

calendarSchema.pre("find", autopopulate);
calendarSchema.pre("findOne", autopopulate);

module.exports = mongoose.model("Calendar", calendarSchema);
