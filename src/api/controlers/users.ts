import User from "../models/user";
import mongoose from "mongoose";
import { utcParse } from "d3";

export async function create(
  product: string,
  birthdate: string,
  country: string,
  followers: number
) {
  const created = new Date();
  const updated = created;
  const user = new User({
    _id: mongoose.Types.ObjectId(),
    product,
    birthdate,
    country,
    created,
    updated,
    followers
  });
  await user.save();
}

export async function saveToDB(
  product: string,
  birthdate: string,
  country: string,
  followers: number
) {
  await create(product, birthdate, country, followers);
}