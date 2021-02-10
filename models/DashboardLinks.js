const mongoose = require("mongoose");
// const { stringify } = require("uuid");
mongoose.Promise = global.Promise;
const { permissionList } = require("../handlers/permissions");

const dashboardLinksSchema = new mongoose.Schema({
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

  link: {
    type: String,
  },
  permissions: {
    type: [String],
    enum: permissionList,
    required: true,
    default: [],
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

module.exports = mongoose.model("DashboardLinks", dashboardLinksSchema);
