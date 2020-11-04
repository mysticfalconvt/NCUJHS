const mongoose = require("mongoose");
const { stringify } = require("uuid");
mongoose.Promise = global.Promise;

const progressSchema = new mongoose.Schema({
  created: {
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
  rating: [
    {
      rating: Number,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

function autopopulate(next) {
  this.populate("teacher");
  this.populate("student");
  next();
}

progressSchema.pre("find", autopopulate);
progressSchema.pre("findOne", autopopulate);

progressSchema.index({
  title: "text",
  description: "text",
});

module.exports = mongoose.model("Progress", progressSchema);
