import mongoose, { Document, Schema } from "mongoose";

const UserSchema: Schema = new Schema({
  _id: mongoose.Types.ObjectId,
  birthdate: { type: String },
  country: { type: String },
  created: { type: Date },
  updated: { type: Date },
  product: String,
  followers: Number
});

export interface IUser extends Document {
  _id: string;
  birthdate: string;
  country: string;
  created: Date;
  updated: Date;
  product: string;
  followers: number;
}

export default mongoose.model<IUser>("User", UserSchema);
