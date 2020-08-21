import express, { Express } from "express";
import path from "path";
import mongoose, { Mongoose } from "mongoose";
import dotenv from "dotenv";
import { Post, PostInt } from "./interfaces/PostInt";
import bodyParser from "body-parser";
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

app.post("/reply/:postID", async (req, res) => {
  const reply = {
    author: req.body.replyname,
    date: new Date(Date.now()).toLocaleDateString(),
    content: req.body.replycontent,
  };
  await Post.findOneAndUpdate(
    { _id: req.params.postID },
    { $push: { replies: reply } }
  );
  res.redirect("/");
});

app.post("/new", (req, res) => {
  console.log(req.body);
  const newPost = new Post({
    title: req.body.title,
    author: req.body.author,
    date: new Date(Date.now()).toLocaleDateString(),
    content: req.body.content,
    replies: [],
  });
  newPost.save();
  res.redirect("/");
});

app.post("/delete/:postID", async (req, res) => {
  await Post.findOneAndDelete({ _id: req.params.postID });
  res.redirect("/");
});

app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
