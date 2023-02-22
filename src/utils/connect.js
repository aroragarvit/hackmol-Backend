import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const dbUrl = process.env.DB_URL;

async function Connect() {
  try {
    await mongoose.connect(dbUrl); // its an async function so we need to await it and we are using try catch block to catch any error
    console.log("Connected correctly to server");
  } catch (err) {
    console.log(err.stack);
  }
}
export default Connect;
