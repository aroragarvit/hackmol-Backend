import jwt from "jsonwebtoken";
import { User } from "../models/user.mjs";

export async function verifyEmail(req, res, next) {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ error: "Token not found" });
    }

    const decdoded_mail = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOneAndUpdate(
      { email: decdoded_mail.email, emailVerificationToken: token },
      { emailVerified: true, emailVerificationToken: null }
    );
    // we are getting the token in email of same person we have in database saved  and then we are decoding the token and then we are
    // finding the user with the email and then we are updating the emailVerified to true and
    // then we are setting the emailVerificationToken to null
    // means we are getting the main so mail is valid and we are setting mail verified to true for that mail
    // so in login we can check if the mail is verified or not
    // If in login if mail is not verified then we can send mail to the user to verify the mail
    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid email verification token" });
    }
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
