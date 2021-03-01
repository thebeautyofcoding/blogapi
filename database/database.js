
require('dotenv').config()


const mongoose = require("mongoose");

// Replace this with your MONGOURI.
const MONGOURI = process.env.DATABASE_URL
console.log(MONGOURI)

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
    console.log("Connected to DB !!");
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;