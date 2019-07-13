import User from "../models/user";
import mongoose from "mongoose";

export async function create(
  product: string,
  birthdate: string,
  country: string,
  followers: number,
  score: number,
  term: string
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
    followers,
    score,
    term
  });
  await user.save();
}

export async function saveToDB(
  product: string,
  birthdate: string,
  country: string,
  followers: number,
  score: number,
  term: string
) {
  await create(product, birthdate, country, followers, score, term);
}
