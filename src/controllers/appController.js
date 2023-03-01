import { User } from "../models/user.mjs";
import jwt, { verify } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

import { sendMail } from "../utils/sendMail.js";

// mana signup ka time jo email dala aur usi email sa verification token bana ka
//bheja usi mail pa matlab agar us mail ka link sa mera token verify ho raha ha matlab
//decode ho raha ha iska matlab mera vo  mail valid ha
export async function signup(req, res) {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    // write code in case we have both email and username for existing user

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username already exists" });
      } else if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already exists" });
      } else if (
        existingUser.email === email &&
        existingUser.username === username
      ) {
        return res
          .status(400)
          .json({ error: "Username and enail already exist" });
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
    res.cookie("emailVerificationToken", emailVerificationToken, {
      //  WE can aslo use query for this means send the token in the query string
      // Its better to use link and query because we can use the link in the email and the user can click on the link and then the link will be sent to the server and then the server will verify the token so enter the token in the query string instead
      httpOnly: false,
      expires: new Date(Date.now() + 3600000),
    });

    const user = new User({
      username,
      email,
      password,
      emailVerificationToken, // there is not much sense of saving in the database because we are sending the token in the email and then we are verifying the token in the query string
    });

    await user.save();

    await sendMail(email, emailVerificationToken);

    if (User.findOne({ _id: user._id }).emailVerified !== true) {
      User.deleteOne({ _id: user._id });
      return res
        .status(400)
        .json({ error: "User not created because email not veerified" });
    }

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
    await User.deleteOne({ _id: user._id });
    return res
      .status(401)
      .json({ error: "Email not verified Not a valid user" });
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

//export async function onboard(req, res) {
//  try {
//    const user = await User.findById(req.id); // we are gtting id from verifyJWT.js middleware using payload decoding from token and setting it to req.id
//    if (!user) {
//      return res.status(404).json({ error: "User not found" });
//    } else {
//      const website = req.body.website;
//      // add website to user's websites array in database if no array then create one and no duplicates
//      console.log(user.websites);
//      if (user.websites) {
//        console.log("user have wesbites");
//        user.websites.push(website);
//        await user.save();
//        console.log("user website saved");
//      }
//      if (!user.websites) {
//        console.log("user dont have wesbites");
//        user.websites = [website];
//        await user.save();
//        console.log("user website saved");
//      }
//
//      return res.status(200).json({ message: "Website added successfully" });
//    }
//  } catch (error) {
//    console.error(error);
//    return res.status(500).json({ error: "Internal server error" });
//  }
//}
