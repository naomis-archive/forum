import { Router } from "express";
import { Post, PostInt } from "../interfaces/PostInt";
import xss from "xss";

const router = Router();

router.get("/posts", async (_, res) => {
  const postList: PostInt[] = [];
  await Post.find({}, (err, posts) => {
    posts.forEach((post) => postList.push(post));
  });
  res.send(postList);
});

router.post("/reply/:postID", async (req, res) => {
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

router.post("/new", (req, res) => {
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

router.post("/delete/:postID", async (req, res) => {
  if (req.body.adminpass === process.env.ADMIN) {
    await Post.findOneAndDelete({ _id: req.params.postID });
  }
  res.redirect("/");
});

export default router;