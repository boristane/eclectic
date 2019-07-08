import mongoose, { Document, Schema } from "mongoose";

const UserSchema: Schema = new Schema({
  _id: mongoose.Types.ObjectId,
  spotifyId: { type: String, required: true, unique: true },
  birthdate: { type: String },
  country: { type: String },
  created: { type: Date },
  updated: { type: Date },
  numLogins: { type: Number }
});

export interface IUser extends Document {
  _id: string;
  spotifyId: string;
  birthdate: string;
  country: string;
  created: Date;
  updated: Date;
  numLogins: number;
}

export default mongoose.model<IUser>("User", UserSchema);
