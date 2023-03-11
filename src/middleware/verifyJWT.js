import jwt from "jsonwebtoken";

export async function verifyToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized ! NO token exists" });
  }
  try {
    // agar ma merre token ko decode karna chahta hu toh ma usko jwt.verify() mei pass karta hu
    // aur usko decode karta hu aur agar decode ho jata ha aur muza user mil jata ha to matlab user authenticated ha mera
    // kyuki agar token ha aur decod ho raha ha matlab login successful hua hoga mtlb password compare aur database sa check hua hoga
    // We are getting token on login only and at that time we are comparing password and username everything and jwt tokens are non forgable so we can trust on the token
    // aur jo login kar raha ha vo database ma ha aur vahi token bjej raha ha aur token ko decode kar raha ha to matlab user authenticated ha

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res
          .status(401)
          .json({ error: "Unauthorized ! invalid or expired token" });
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
