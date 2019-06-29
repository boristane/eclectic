import { generateRandomString } from "../utils";
import { Request, Response } from "express";
import qs from "qs";
import axios from "axios";

require("dotenv").config();

const clientId = process.env["SPOTIFY_CLIENT_ID"];
const clientSecret = process.env["SPOTIFY_CLIENT_SECRET"];
const redirectUri = process.env["SPOTIFY_REDIRECT_URI"];
const dialog = process.env["SPOTIFY_DIALOG"] === "true" ? true : false;

const stateKey = "spotify_auth_state";

export function login(req: Request, res: Response) {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);
  var scope = "user-read-private user-read-email user-top-read";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      qs.stringify({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
        show_dialog: dialog
      })
  );
}

export async function getToken(req: Request, res: Response) {
  const { code, state } = req.query;
  const storedState = req.cookies ? req.cookies[stateKey] : undefined;

  if (state === undefined || state !== storedState) {
    return res.status(500).json({ error: "state_mismatch" });
  }

  res.clearCookie(stateKey);
  const auth = "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const data = {
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code"
  };
  const dataString = qs.stringify(data);
  const axiosConfig = {
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      dataString,
      axiosConfig
    );
    res.status(200).json(response.data);
  } catch {
    res.status(500).json({ error: "invalid_token" });
  }
}

export async function refreshToken(req: Request, res: Response) {
  const token = req.query.refresh_token;
  const auth = "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const data = {
    grant_type: "refresh_token",
    refresh_token: token
  };
  const dataString = qs.stringify(data);
  const axiosConfig = {
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      dataString,
      axiosConfig
    );
    res.status(200).json(response.data);
  } catch {
    res.status(500).json({ error: "invalid_token" });
  }
}

export async function getTopArtists(req: Request, res: Response) {
  const { token } = req.query;
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/top/artists", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    res.status(200).json(response.data);
  } catch {
    res.status(500).json({ error: "Unexpected error." });
  }
}
