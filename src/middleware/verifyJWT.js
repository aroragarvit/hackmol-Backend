import jwt from "jsonwebtoken";

export async function verifyToken(req, res, next) {
  console.log("hello");
  const token = req.cookies.token || req.headers.authorization;
  console.log(token);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    // agar ma merre token ko decode karna chahta hu toh ma usko jwt.verify() mei pass karta hu
    // aur usko decode karta hu aur agar decode ho jata ha aur muza user mil jata ha to matlab user authenticated ha mera
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).json({ error: "Unauthorized" });
      } else {
        console.log("decoded", decoded);
        req.user = decoded.username;
        req.id = decoded.id;
        console.log("authenticated");
        next();
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
