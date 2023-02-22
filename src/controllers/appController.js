import { User } from "../models/user";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function signup(req, res) {
  //  try {
  //    const { username, email, password } = req.body;
  //    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  //    // write code in case we have both email and username for existing user
  //
  //    if (existingUser) {
  //      if (existingUser.username === username) {
  //        return res.status(400).json({ error: "Username already exists" });
  //      } else if (existingUser.email === email) {
  //        return res.status(400).json({ error: "Email already exists" });
  //      }
  //    }
  //
  //    const user = new User({ username, email, password });
  //    await user.save();
  //
  //    return res.status(201).json({ message: "User created successfully" });
  //  } catch (error) {
  //    console.error(error);
  //    return res.status(500).json({ error: "Internal server error" });
  //  }
  console.log("signup");
}

export async function login(req, res) {
  //  const { username, email, password } = req.body;
  //  const user = await User.findOne({ $or: [{ username }, { email }] });
  //  if (!user) {
  //    return res.status(404).json({ error: "User not found" });
  //  }
  //  const isMatch = await user.comparePassword(password);
  //  if (isMatch) {
  //    jwt.sign(
  //      {
  //        id: user._id,
  //        username: user.username,
  //      },
  //      process.env.JWT_SECRET,
  //      { expiresIn: "1h" },
  //      (err, token) => {
  //        if (err) {
  //          console.error(err);
  //          return res.status(500).json({ error: "Internal server error" });
  //        }
  //
  //        res.setHeader("Authorization", `Bearer ${token}`);
  //
  //        res.cookie("token", token, {
  //          httpOnly: true,
  //          maxAge: 3600000, // 1 hour
  //        });
  //
  //        return res.status(200).send({
  //          msg: "Login successful",
  //          token: token,
  //          username: user.username,
  //        });
  //      }
  //    );
  //  } else {
  //    return res.status(401).json({ error: "Invalid credentials" });
  //  }

  console.log("login");
}
