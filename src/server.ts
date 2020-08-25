import express, { Express } from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import helmet from "helmet";
import { User } from "./interfaces/UserInt";
import passport from "passport";
import expressSession from "express-session";
import connectEnsureLogin from "connect-ensure-login";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
dotenv.config();
const app: Express = express();

//environment variables
const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO_URI || "";
const expSecret = process.env.EXPSECRET || "";

//mongodb connection
mongoose
  .connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected!"));

//security middleware
app.use(
  helmet({
    expectCt: false,
    hsts: false,
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "object-src": ["'none'"],
        "style-src-elem": ["'self'", "fonts.googleapis.com"],
        "font-src": ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
      },
    },
  })
);

//other middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname + "/../public")));
app.use(
  expressSession({ secret: expSecret, resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//routes
app.use(authRoutes);
app.use(postRoutes);

//main page route
app.get("/", (req, res) => {
  connectEnsureLogin.ensureLoggedIn();
  res.sendFile(path.join(__dirname + "/../views/index.html"));
});

//get landing page
app.get("/welcome", (req, res) => {
  res.sendFile(path.join(__dirname + "/../views/welcome.html"));
});

app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
