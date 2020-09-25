import auth from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { UserModel } from "../interfaces/UserInt";

auth.use(
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

auth.use(
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

auth.use(
  "jwt",
  new JwtStrategy(
    {
      secretOrKey: process.env.JWT || "null",
      jwtFromRequest: ExtractJwt.fromAuthHeader(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);

export default auth;
