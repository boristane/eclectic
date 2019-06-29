import express from "express";
import cookieParser from "cookie-parser";
import { login, getToken, doIt, refreshToken } from "./api/spotify-controller";

const app = express()
  .use(express.static(__dirname + "/../public"))
  .use(express.json())
  .use(cookieParser());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  return next();
});

app.get("/login", login);
app.get("/get-token", getToken);
app.get("/refresh-token", refreshToken);
app.get("/top-artists", doIt);

export default app;
