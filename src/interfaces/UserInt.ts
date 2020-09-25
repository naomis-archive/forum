import { Document, Model, model, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface UserInt extends Document {
  username: string;
  password: string;
  isValidLogin(arg0: string): Promise<boolean>;
}

export const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: String,
});

UserSchema.pre("save", async function (next) {
  const hash = await bcrypt.hash((this as UserInt).password, 10);
  (this as UserInt).password = hash;
  next();
});

UserSchema.methods.isValidLogin = async function (password: string) {
  const compare = await bcrypt.compare(password, this.password);
  return compare;
};

export interface UserModelInt extends Model<UserInt> {
  isValidLogin(password: string): Promise<boolean>;
}

export const UserModel = model<UserInt>("user", UserSchema);
