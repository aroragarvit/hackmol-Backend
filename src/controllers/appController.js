import { User } from "../models/user.mjs";
import jwt, { verify } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

import { sendMail } from "../utils/sendMail.js";

//mana signup ka time jo email dala aur usi email sa verification token bana ka
//bheja usi mail pa matlab agar us mail ka link sa mera token verify ho raha ha matlab
//decode ho raha ha iska matlab mera vo  mail valid ha
export async function signup(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide username, email and password" });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    // write code in case we have both email and username for existing user
    if (existingUser) {
      if (existingUser.email === email && existingUser.username === username) {
        return res
          .status(400)
          .json({ error: "Username and email already exist" });
      } else if (existingUser.username === username) {
        return res.status(400).json({ error: "Username already exists" });
      } else if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // verification of email address using sending email to the user and then verifying the email address

    const emailVerificationToken = jwt.sign(
      {
        email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    //  res.cookie("emailVerificationToken", emailVerificationToken, {
    //    //  WE can aslo use query for this means send the token in the query string
    //    // Its better to use link and query because we can use the link in the email and the user can click on the link and then the link will be sent to the server and then the server will verify the token so enter the token in the query string instead
    //    httpOnly: false,
    //    expires: new Date(Date.now() + 3600000),
    //  });
    // Dont send cookie otherwise user will verify from token only  from browser itself

    const user = new User({
      username,
      email,
      password,
      emailVerificationToken,
    });

    await user.save();

    await sendMail(email, emailVerificationToken);

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req, res) {
  const { username, email, password } = req.body;

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!user.emailVerified) {
    await sendMail(user.email, user.emailVerificationToken);
    return res
      .status(401)
      .json({ error: "Email not verified. Verification email sent." });
  }

  const isMatch = await user.comparePassword(password);

  if (isMatch) {
    jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal server error" });
        }

        res.setHeader("Authorization", `Bearer ${token}`);

        res.cookie("token", token, {
          httpOnly: false,
          maxAge: 3600000, // 1 hour
        });

        return res.status(200).send({
          msg: "Login successful",
          token: token,
          username: user.username,
        });
      }
    );
  } else {
    return res.status(401).json({ error: "Invalid credentials" });
  }
}

export async function logout(req, res) {
  res.clearCookie("token");

  // Clear the authorization header as well
  res.setHeader("Authorization", "");

  return res.status(200).send({ msg: "Logged out successfully" });
}

export async function onboard(req, res) {
  // run this after protected middleware so that we can get the id from the token
  try {
    const user = await User.findById(req.id); // we are gtting id from verifyJWT.js middleware using payload decoding from token and setting it to req.id
    if (!user) {
      return res.status(404).json({ error: "User not found" }); // and then we are checking if that user exists or not
    } else {
      return res.status(200).json({ message: "User is logged in" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
