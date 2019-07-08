import { IArtistListDataItem, ISpotifyArtist, ISpotifyTrack, ISpotifyUser } from "../../types";
import { Request, Response } from "express";

import axios from "axios";
import { generateRandomString } from "../utils";
import qs from "qs";
import { saveToDB } from "./users";

require("dotenv").config();

const axiosInstance = axios.create({ baseURL: "https://api.spotify.com/v1" });
const term = "medium_term";

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

export async function doIt(req: Request, res: Response) {
  const { token } = req.query;
  try {
    const user = await getUserProfile(token);
    const country = user.country;
    const topArtists: IArtistListDataItem[] = await getTopArtists(token, country);
    const genreClusters = clusterGenres(topArtists);
    const connections = await findConnections(token, topArtists);
    const topTracks = (await getTopTracks(token)).items;
    const explicit = getExplicit(topTracks);
    const tracksAgesClusters = clusterTracksAges(topTracks);
    saveToDB(user.product, user.birthdate, user.country, user.followers.total);

    res.status(200).json({
      genreClusters,
      topArtists,
      connections,
      topTracks,
      explicit,
      user,
      tracksAgesClusters
    });
  } catch (err) {
    res.status(500).json({ error: "Unexpected error.", err: err.stack });
  }
}

async function getTopArtists(token: string, country: string): Promise<IArtistListDataItem[]> {
  const response = await axiosInstance.get(`/me/top/artists/?time_range=${term}&limit=50`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const artists: ISpotifyArtist[] = response.data.items;
  const artistsTopTracks = [];
  for (let i = 0; i < artists.length; i += 1) {
    const artistTopTracks = (await getArtistTopTracks(token, artists[i].id, country)).tracks;
    const track = artistTopTracks[Math.floor(Math.random() * artistTopTracks.length)];
    artistsTopTracks.push({ artistID: artists[i].id, track });
  }
  const topArtists: IArtistListDataItem[] = artists.map((artist, index) => ({
    name: artist.name,
    rank: index + 1,
    image: artist.images[0].url,
    id: artist.id,
    track: artistsTopTracks.find(a => a.artistID === artist.id).track,
    popularity: artist.popularity,
    genres: artist.genres
  }));
  return topArtists;
}

async function getArtistTopTracks(
  token: string,
  artistID: string,
  country: string
): Promise<{ tracks: ISpotifyTrack[] }> {
  const response = await axiosInstance.get(`/artists/${artistID}/top-tracks?country=${country}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function getTopTracks(token: string): Promise<{ items: ISpotifyTrack[] }> {
  const response = await axiosInstance.get(`/me/top/tracks/?time_range=${term}&limit=50`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function getConnections(
  token: string,
  artist: IArtistListDataItem
): Promise<{ artist: IArtistListDataItem; connections: ISpotifyArtist[] }> {
  const response = await axiosInstance.get(`/artists/${artist.id}/related-artists`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return { artist, connections: response.data.artists };
}

async function findConnections(
  token: string,
  artists: IArtistListDataItem[]
): Promise<{ links: { source: string; target: string }[]; nodes: any }> {
  const nodes = [];
  const links: { source: string; target: string }[] = [];
  const artistsIDs = artists.map(artist => artist.id);
  const promises = artists.map(artist => getConnections(token, artist));
  const resolves = await Promise.all(promises);
  resolves.forEach(resolve => {
    const relatedArtists = resolve.connections;
    const relatedArtistsIDs = relatedArtists.map(artist => artist.id);
    const commonIDs = artistsIDs.filter(value => relatedArtistsIDs.includes(value));
    if (commonIDs.length > 0) {
      const commonArtists = commonIDs.map(id => artists.find(artist => artist.id === id));
      commonArtists.forEach(commonArtist => {
        links.push({ source: resolve.artist.name, target: commonArtist.name });
        const temp = nodes.find(artist => artist.id === commonArtist.name);
        if (temp !== undefined) {
          temp.numLinks += 1;
        }
      });
    }
    nodes.push({
      id: resolve.artist.name,
      image: resolve.artist.image,
      i: resolve.artist.id,
      group: resolve.artist.genres[0],
      track: resolve.artist.track,
      rank: resolve.artist.rank,
      numLinks: commonIDs.length
    });
  });
  return { links, nodes };
}

function clusterGenres(
  artists: IArtistListDataItem[]
): { genre: string; count: number; artists: IArtistListDataItem[] }[] {
  const cluster: { genre: string; count: number; artists: IArtistListDataItem[] }[] = [];
  artists.forEach(artist => {
    const genres = artist.genres;
    genres.forEach(genre => {
      const g = cluster.find(c => c.genre === genre);
      if (g === undefined) {
        cluster.push({
          genre,
          count: 1,
          artists: [artist]
        });
      } else {
        g.count += 1;
        g.artists.push(artist);
      }
    });
  });
  return cluster;
}

function clusterTracksAges(tracks: ISpotifyTrack[]) {
  const result: { year: number; tracks: ISpotifyTrack[] }[] = [];
  tracks.forEach(track => {
    const year = Number(track.album.release_date.split("-")[0]);
    const currentYearObject = result.find(o => o.year === year);
    if (!currentYearObject) {
      result.push({
        year,
        tracks: [track]
      });
    } else {
      currentYearObject.tracks.push(track);
    }
  });
  return result;
}

function getExplicit(tracks: any[]): { explicit: number; total: number } {
  const total = tracks.length;
  const explicit = tracks.filter(track => track.explicit).length;
  return { explicit, total };
}

async function getUserProfile(token: string): Promise<ISpotifyUser> {
  const response = await axiosInstance.get(`/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}
