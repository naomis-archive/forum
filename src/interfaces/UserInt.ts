import { Document, Schema, model, PassportLocalSchema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

export interface UserInt extends Document {
  username: string;
  password: string;
  email: string;
  name: string;
  joinDate: string;
  lastLogin: string;
}

export const UserSchema = new Schema({
  username: String,
  password: String,
  email: String,
  name: String,
  joinDate: String,
  lastLogin: String,
});

UserSchema.plugin(passportLocalMongoose);
export const User = model<UserInt>("user", UserSchema as PassportLocalSchema);
