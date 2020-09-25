import express, { Express } from "express";
import path from "path";
import mongoose, { Mongoose } from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import helmet from "helmet";
import mainRoutes from "./routes/main";
import postRoutes from "./routes/posts";
import authRoutes from "./routes/auth";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { UserModel } from "./interfaces/UserInt";

passport.use(
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

passport.use(
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

passport.use(
  "jwt",
  new JwtStrategy(
    {
      secretOrKey: process.env.JWT || "null",
      jwtFromRequest: ExtractJwt.fromHeader("auth"),
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

//config environment variables
dotenv.config();
const app: Express = express();
const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO_URI || "";

//database connection
mongoose
  .connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected!"));

//mount the middleware!
app.use(
  helmet({
    expectCt: false,
    hsts: false,
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "object-src": ["'none'"],
        "style-src-elem": ["'self'", "fonts.googleapis.com"],
        "font-src": ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
      },
    },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//serve static assets
app.use("/public", express.static(path.join(__dirname + "/../public")));

//use routes
app.use(authRoutes);
app.use(mainRoutes, passport.authenticate("jwt"));
app.use(postRoutes, passport.authenticate("jwt"));

app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
 