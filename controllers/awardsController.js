const mongoose = require("mongoose");
const Awards = require("../models/Awards");
// const { update } = require("../models/User");
// const { userSearchResult } = require("./userController");
const Progress = mongoose.model("Progress");
const User = mongoose.model("User");
const Award = mongoose.model("Awards");

exports.addAward = async (req, res) => {
    awards = await Award.find({teacher: req.user.id})
//    res.json(awards)
      res.render('awardsForm', { title: 'Give HOWL Award' , award: {}, awards: awards});
   
  };

  exports.createAward = async (req, res) =>{
    req.body.teacher = req.user.id;
    const award = await new Award(req.body).save();
    res.redirect("/awards/add")
  }


  exports.viewAwards = async (req, res) => {
awards = await Awards.find({trimester: "3"});
res.render('viewAwards', {title: "View All HOWL Awards", awards: awards})

  }