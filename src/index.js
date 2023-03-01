import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();
import { verifyToken } from "./middleware/verifyJWT.js";
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.disable("x-powered-by"); // disable the x-powered-by header in the response to prevent information leakage about the server software used to handle the request

const port = process.env.PORT;
import { signup, login, logout } from "./controllers/appController.js";
import { verifyEmail } from "./middleware/verifyMail.js";
import Connect from "./utils/connect.js"; // importing connect function from utils folder
const server = app.listen(port, async () => {
  console.log(server.address);
  const host = server.address().address;
  const port = server.address().port;
  console.log("Server is running on port " + port + "on host " + host);
  await Connect();
});

app.post("/signup", signup);
app.post("/login", login);
app.get("/protected", verifyToken, (req, res) => {
  console.log("hello");
  res.end();
});
app.get("/verify", verifyEmail);
app.post("/logout", verifyToken, logout);
//app.post("/onboard", verifyToken, onboard);
app.use(function (req, res, next) {
  res.status(404).sendFile("./views/404.html", { root: __dirname });
});
