import express, { Express } from "express";
import path from "path";
import mongoose, { Mongoose } from "mongoose";
import dotenv from "dotenv";
import { Post, PostInt } from "./interfaces/PostInt";
import bodyParser from "body-parser";
import helmet from "helmet";
import xss from "xss";
dotenv.config();
const app: Express = express();

const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO_URI || "";

mongoose
  .connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected!"));

app.use(
  helmet({
    expectCt: false,
    hsts: false,
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "object-src": ["'none'"],
        "font-src": ["'self'", "fonts.gstatic.com"],
        "style-src-elem": ["'self'", "fonts.gstatic.com"],
      },
    },
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname + "/../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/../views/index.html"));
});

app.get("/posts", async (req, res) => {
  const postList: PostInt[] = [];
  await Post.find({}, (err, posts) => {
    posts.forEach((post) => postList.push(post));
  });
  res.send(postList);
});

app.get("/welcome", (req, res) => {
  res.sendFile(path.join(__dirname + "/../views/welcome.html"));
});

app.get("/agree", (req, res) => {
  res.redirect("/");
});

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

app.post("/delete/:postID", async (req, res) => {
  if (req.body.adminpass === process.env.ADMIN) {
    await Post.findOneAndDelete({ _id: req.params.postID });
  }
  res.redirect("/");
});

app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
