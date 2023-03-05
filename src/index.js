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
const io = new Server(server);

// Handle socket.io connections
io.on("connection", async (socket) => {
  // Use socket authentication middleware to verify token
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      socket.decoded = decoded;
      next();
    } catch (error) {
      return next(new Error("Authentication error"));
    }
  });

  // Handle "join room" event
  socket.on("join room", async (data) => {
    console.log("New client connected");
    const { id } = socket.client;
    const interests = data.interests;
    const rooms = await Room.find({ interests: { $in: interests } });
    if (rooms.length) {
      const room = rooms.find((room) => room.users.length === 1);
      if (room) {
        socket.join(room._id);
        io.to(room._id).emit("user joined", { userId: id });
      } else {
        const newRoom = await Room.create({ interests, users: [id] });
        socket.join(newRoom._id);
      }
    }
  });

  // Handle "disconnect" event
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Middleware for CORS and headers
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.disable("x-powered-by");
app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "https://localhost:3000, https://localhost:3001"
  );
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/signup", signup);
app.post("/login", login);
app.get("/protected", verifyToken, (req, res) => {
  console.log("hello");
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
