import jwt from "jsonwebtoken";
import { User } from "../models/user.mjs";

export async function verifyEmail(req, res, next) {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ error: "Token not found" });
    }

    const decdoded_mail = jwt.verify(token, process.env.JWT_SECRET); // agar decode nahi hua matlab token invalid , matlab jo email dal raha ha vo bhi invalid ha because jo mail dal raha ha usi pa mail ja raha ha , ha to user database sa check nahi hoga kyuki user kuch ayaga hi nahi decode hoka

    const user = await User.findOneAndUpdate(
      { email: decdoded_mail.email, emailVerificationToken: token },
      { emailVerified: true, emailVerificationToken: null }
    );

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
