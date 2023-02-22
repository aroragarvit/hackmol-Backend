import express from "express";
import cors from "cors";
import morgan from "morgan";
import { User } from "./models/user.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.disable("x-powered-by"); // disable the x-powered-by header in the response to prevent information leakage about the server software used to handle the request

const port = process.env.PORT;

import Connect from "./utils/connect.js"; // importing connect function from utils folder
const server = app.listen(port, async () => {
  console.log(server.address);
  const host = server.address().address;
  const port = server.address().port;
  console.log("Server is running on port " + port + "on host " + host);
  await Connect();
});

app.post("/signup", async function (req, res) {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    // write code in case we have both email and username for existing user

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username already exists" });
      } else if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    const user = new User({ username, email, password });
    await user.save();

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.use(function (req, res, next) {
  res.status(404).sendFile("./views/404.html", { root: __dirname });
});
