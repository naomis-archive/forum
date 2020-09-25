import { Schema } from "mongoose";
import AuthRoutes from "passport";
import { Strategy } from "passport-local";
import { UserInt, UserModel } from "../interfaces/UserInt";

const LocalStrategy = Strategy;

AuthRoutes.use(
  "signup",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        const user = await UserModel.create({ username, password });
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

AuthRoutes.use(
  "login",
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      try {
        const user = await UserModel.findOne({ username });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        const validate = await user.isValidLogin(password);
        if (!validate) {
          return done(null, false, { message: "Wrong Password" });
        }
        return done(null, user, { message: "Login success!" });
      } catch (error) {
        return done(error);
      }
    }
  )
);
