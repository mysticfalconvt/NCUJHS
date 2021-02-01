const mongoose = require("mongoose");
const { isStaff } = require("../handlers/permissions");
const Info = mongoose.model("Info");
const User = mongoose.model("User");

exports.addInfo = (req, res) => {
  res.render("editInfo", { title: "Add Important Info" });
};

exports.getInfo = async (req, res) => {
  const category = req.params.category || "category";
  let sort = {};
  sort[category] = 1;
  let infos = {};
  if (req.user) {
    // check if teacher for calendar events
    if (isStaff(req.user)) {
      infos = await Info.find({ deleted: { $ne: "true" } }).sort(sort);
    } else {
      infos = await Info.find({
        teachersOnly: "",
        deleted: { $ne: "true" },
      }).sort(sort);
    }
  } else {
    infos = await Info.find({
      teachersOnly: "",
      deleted: { $ne: "true" },
    }).sort({ category: 1 });
  }
  res.render("infos", { title: "Important Links & Documents", infos: infos });
};

exports.createInfo = async (req, res) => {
  req.body.author = req.user.id;
  const info = await new Info(req.body).save();
  req.flash("success", `Successfully Created ${info.title}.`);
  res.redirect(`/info/search/category`);
};

exports.updateInfo = async (req, res) => {
  // find and update store
  const info = await Info.findOneAndUpdate({ _id: req.params._id }, req.body, {
    new: true,
    runValidators: true,
  }).exec();
  // redirect to the store and tell them it worked
  req.flash("success", `Sucessfully Updated <strong>${info.title}</strong>.`);
  res.redirect(`/info/search/category`);
};
const confirmOwner = (calendar, user) => {
  if (!calendar.author.equals(user._id)) {
    throw Error("You must own an event in order to edit it!");
  }
};
exports.editInfo = async (req, res) => {
  //find the event given id
  const info = await Info.findOne({ _id: req.params._id });

  //confirm they are owner of the event or admin
  if (!req.user.permissions.include("admin")) {
    confirmOwner(info, req.user);
  }

  //render out the edit form so they can edit
  res.render("editInfo", { title: `edit ${info.title}`, info });
};

// API

exports.searchInfos = async (req, res) => {
  const teacher = isStaff(req.user);
  const infos = await Info.find(
    {
      $text: {
        $search: req.query.q,
      },
      $or: [{ teachersOnly: teacher }, { teachersOnly: "" }],
    },
    {
      score: { $meta: "textScore" },
    },
  )
    .sort({
      score: { $meta: "textScore" },
    })
    .limit(10);
  res.json(infos);
};
