const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const pbisTeamSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  teacher1: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply a teacher1!",
  },
  teacher2: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply a teacher2!",
  },
  teacher3: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: null,
  },
  totalCards: {
    type: Number,
    default: 0,
  },
  currentUncountedCards: {
    type: Number,
    default: 0,
  },
  numberOfStudents: {
    type: Number,
    default: 0,
  },
  currentLevel: {
    type: Number,
    default: 0,
  },
  averageCardsPerStudent: {
    type: Number,
    default: 0,
  },
  schoolWide: {
    type: Boolean,
    default: false,
  },
  lowestLevel: Number,
  nextGoal: Number,
  teamsAtGoal: Number,
  totalTeams: Number,
});

function autopopulate(next) {
  this.populate("teacher1");
  this.populate("teacher2");
  this.populate("teacher3");
  next();
}

pbisTeamSchema.pre("find", autopopulate);
pbisTeamSchema.pre("findOne", autopopulate);

module.exports = mongoose.model("PbisTeam", pbisTeamSchema);
