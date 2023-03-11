import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import { createServer } from "http";
import { Server } from "socket.io";
import { verifyToken } from "./middleware/verifyJWT.js";
import { signup, login, logout, onboard } from "./controllers/appController.js";
import { verifyEmail } from "./middleware/verifyMail.js";
import Connect from "./utils/connect.js";
import { Room } from "./models/roomSchema.mjs";

const app = express();
const port = process.env.PORT;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Handle socket.io connections

// Middleware for CORS and headers
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.disable("x-powered-by");
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

io.use(async (socket, next) => {
  console.log("Socket use effect going to run");
  const token = socket.handshake.query.token;
  if (!token) {
    return next(new Error("Authentication error - no token provided"));
  }
  try {
    console.log("verifying Token");
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    socket.decoded = decoded;
    console.log("Authenticated On socket connection");
    next();
  } catch (error) {
    console.log(error);
    return next(new Error("Authentication error"));
  }
});
io.on("connection", async (socket) => {
  // verify authenticated on each event also
  // Use socket authentication middleware to verify token
  console.log(
    "client connected with id " +
      socket.id +
      " and Name  " +
      socket.decoded.username
  );
  //
  // Handle "join room" event
  socket.on("join room", async (data) => {
    const { id } = socket.client;
    console.log("id", id);
    const interests = data.interests;
    const currentRoom = await Room.findOne({ users: id });
    if (currentRoom) {
      // Remove the user from the current room's users list
      currentRoom.users = currentRoom.users.filter((userId) => userId !== id);
      await currentRoom.save();
      console.log(`Removed client ${id} from room ${currentRoom._id}`);
      // If there's only one user left in the current room, delete the room
      if (currentRoom.users.length === 0) {
        await Room.findByIdAndDelete(currentRoom._id);
        console.log(`Deleted room ${currentRoom._id}`);
      }
    }
    const rooms = await Room.find({ interests: { $in: interests } });
    console.log("rooms with similar insters", rooms);
    if (rooms.length) {
      console.log("Found a room");
      const room = rooms.find((room) => room.users.length === 1);
      if (room) {
        console.log("Found a room with one user");
        socket.join(room._id);
        room.users.push(id);
        await room.save();

        io.to(room._id).emit("user joined", { userId: id });
      } else {
        const newRoom = await Room.create({ interests, users: [id] });
        console.log("newRoom");
        socket.join(newRoom._id);
      }
    } else {
      const newRoom = await Room.create({ interests, users: [id] });
      console.log("newRoom");
      socket.join(newRoom._id);
    }
  });

  // Handle "disconnect" event
  socket.on("disconnect", async () => {
    const { id } = socket.client;
    console.log(`Client  disconnected`);
    const room = await Room.findOne({ users: id });
    if (room) {
      // Remove the user from the room's users list
      room.users = room.users.filter((userId) => userId !== id);
      await room.save();
      console.log(`Removed client ${id} from room ${room._id}`);
      // If there's only one user left in the room, delete the room
      if (room.users.length === 0) {
        await Room.findByIdAndDelete(room._id);
        console.log(`Deleted room ${room._id}`);
      }
    }
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/signup", signup);
app.post("/login", login);
app.get("/protected", verifyToken, (req, res) => {
  res.end();
});
app.get("/verify", verifyEmail);
app.post("/logout", verifyToken, logout);
app.get("/onboard", verifyToken, onboard);
app.use(function (req, res, next) {
  res.status(404).sendFile("./views/404.html", { root: __dirname });
});

// Start server
server.listen(port, async () => {
  console.log(server.address);
  const host = server.address().address;
  const port = server.address().port;
  console.log("Server is running on port " + port + " on host " + host);
  await Connect();
});
