const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const pbisSchema = new mongoose.Schema({
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
  message: {
    type: String,
    default: "",
  },
  counted: {
    type: String,
    default: "",
  },
});

function autopopulate(next) {
  this.populate("teacher");
  this.populate("student");
  next();
}

pbisSchema.pre("find", autopopulate);
pbisSchema.pre("findOne", autopopulate);

module.exports = mongoose.model("Pbis", pbisSchema);
