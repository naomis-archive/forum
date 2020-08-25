import express, { Express } from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Post, PostInt } from "./interfaces/PostInt";
import bodyParser from "body-parser";
import helmet from "helmet";
import xss from "xss";
import { User } from "./interfaces/UserInt";
import passport from "passport";
import expressSession from "express-session";
import connectEnsureLogin from "connect-ensure-login";
import bcrypt from "bcryptjs";
dotenv.config();
const app: Express = express();

//environment variables
const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO_URI || "";
const expSecret = process.env.EXPSECRET || "";
const salt = bcrypt.genSaltSync(10);

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

//main page route
app.get("/", (req, res) => {
  connectEnsureLogin.ensureLoggedIn();
  res.sendFile(path.join(__dirname + "/../views/index.html"));
});

//get posts
app.get("/posts", async (req, res) => {
  const postList: PostInt[] = [];
  await Post.find({}, (err, posts) => {
    posts.forEach((post) => postList.push(post));
  });
  res.send(postList);
});

//get landing page
app.get("/welcome", (req, res) => {
  res.sendFile(path.join(__dirname + "/../views/welcome.html"));
});

//authentication routes
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname + "/../views/register.html"));
});

app.post("/register", async (req, res) => {
  if (req.body.password !== req.body.cpassword) {
    return res.send("Passwords must match.");
  }
  const existingUser = await User.findOne({ username: req.body.username });
  if (existingUser) return res.send("Username in use");
  const savePassword = await bcrypt.hash(req.body.password, salt);
  const newUser = new User({
    username: req.body.username,
    password: savePassword,
    email: req.body.email,
    name: req.body.name,
    joinDate: new Date(Date.now()).toLocaleDateString(),
    lastLogin: new Date(Date.now()).toLocaleDateString(),
  });
  await newUser.save((err, data) => {
    if (err) return res.redirect("/welcome");
    res.redirect("/");
  });
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname + "/../views/login.html"));
});

app.post("/login", async (req, res) => {
  const validUser = await User.findOne({ username: req.body.username });
  if (!validUser) return res.send("Invalid Username");
  const validPass = await bcrypt.compare(req.body.password, validUser.password);
  if (!validPass) return res.send("Invalid Password");
  res.redirect("/");
});

//new post and reply routes
app.post("/reply/:postID", async (req, res) => {
  const reply = {
    author: xss(req.body.replyname.substring(0, 30)),
    date: new Date(Date.now()).toLocaleDateString(),
    content: xss(req.body.replycontent.substring(0, 500)),
  };
  await Post.findOneAndUpdate(
    { _id: req.params.postID },
    { $push: { replies: reply } }
  );
  res.redirect("/");
});

app.post("/new", (req, res) => {
  const newPost = new Post({
    title: xss(req.body.title.substring(0, 30)),
    author: xss(req.body.author.substring(0, 30)),
    date: new Date(Date.now()).toLocaleDateString(),
    content: xss(req.body.content.substring(0, 500)),
    replies: [],
  });
  newPost.save();
  res.redirect("/");
});

//delete route
app.post("/delete/:postID", async (req, res) => {
  if (req.body.adminpass === process.env.ADMIN) {
    await Post.findOneAndDelete({ _id: req.params.postID });
  }
  res.redirect("/");
});

app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
