import User from "../models/user";
import mongoose from "mongoose";
import { utcParse } from "d3";

export async function create(spotifyId: string, birthdate: string, country: string) {
  const document = await User.findOne({ spotifyId }).exec();
  if (document) {
    console.log(`User with spotiy ID ${spotifyId} already created.`);
    return;
  }
  const created = new Date();
  const updated = created;
  const numLogins = 0;
  const user = new User({
    _id: mongoose.Types.ObjectId(),
    spotifyId,
    birthdate,
    country,
    created,
    updated,
    numLogins
  });
  await user.save();
}

export async function update(spotifyId: string) {
  const user = await User.findOne({ spotifyId }).exec();
  if (!user) {
    console.log(`User with spotiy ID ${spotifyId} not fount.`);
    return;
  }
  user.numLogins += 1;
  user.updated = new Date();
  await user.save();
}

export async function saveToDB(spotifyId: string, birthdate: string, country: string) {
  await create(spotifyId, birthdate, country);
  await update(spotifyId);
}
