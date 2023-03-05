import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: String,
  interests: [String],
  users: [String],
});

const Room = mongoose.model("Room", roomSchema);
export { Room };
