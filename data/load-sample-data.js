require("dotenv").config({ path: __dirname + "/../variables.env" });
const fs = require("fs");

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

// import all of our models - they need to be imported only once
// const Store = require('../models/Store');
// const Review = require('../models/Review');
const User = require("../models/User");
const Calendar = require("../models/Calendar");

// const stores = JSON.parse(fs.readFileSync(__dirname + '/stores.json', 'utf-8'));
// const reviews = JSON.parse(fs.readFileSync(__dirname + '/reviews.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync(__dirname + "/users.json", "utf-8"));
// const calendars = JSON.parse(
//   fs.readFileSync(__dirname + "/calendar.json", "utf-8"),
// );

async function deleteData() {
  console.log("😢😢 Goodbye Data...");
  await Store.remove();
  // await Review.remove();
  await User.remove();
  console.log(
    "Data Deleted. To load sample data, run\n\n\t npm run sample\n\n",
  );
  process.exit();
}

async function loadData() {
  try {
    // await Store.insertMany(stores);
    // await Review.insertMany(reviews);
    // await User.insertMany(users);
    // await Calendar.insertMany(calendars);
    console.log("👍👍👍👍👍👍👍👍 Done!");
    process.exit();
  } catch (e) {
    console.log(
      "\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n",
    );
    console.log(e);
    process.exit();
  }
}
async function updateData() {
  try {
    for (const user of users) {
      console.log(user.email);
      const updateData = {
        block6: user.block6,
        block7: user.block7,
        block8: user.block8,
        block9: user.block9,
        ta: user.ta,
      };
      userUpdate = await User.findOneAndUpdate(
        { email: user.email },
        updateData,
      );
      console.log(userUpdate.name);
    }

    console.log("👍👍👍👍👍👍👍👍 Done!");
    process.exit();
  } catch (e) {
    console.log("\n👎👎👎👎👎👎👎👎 Error! The Error info is below");
    console.log(e);
    process.exit();
  }
}
if (process.argv.includes("--delete")) {
  deleteData();
} else if (process.argv.includes("--update")) {
  updateData();
} else {
  loadData();
}
