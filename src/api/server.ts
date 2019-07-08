import { doIt, getToken, login, refreshToken } from "./controlers/spotify";

import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";

const mongoDBURI = `mongodb+srv://eclectic:${
  process.env.MONGO_ATLAS_PASSWORD
}@eclecticdata-zt9sk.mongodb.net/${process.env.MONGO_ATLAS_DATABASE}?retryWrites=true&w=majority`;
mongoose.connect(mongoDBURI, { useNewUrlParser: true });

const app = express()
  .use(express.static(__dirname + "/../../dist"))
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
