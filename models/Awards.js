const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const awardsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply a teacher!",
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply a student!",
  },
    trimester: String,
  category: {
    type: String,
    default: "",
  },
});

function autopopulate(next) {
  this.populate("teacher");
  this.populate("student");
  next();
}

awardsSchema.pre("find", autopopulate);
awardsSchema.pre("findOne", autopopulate);

module.exports = mongoose.model("Awards", awardsSchema);