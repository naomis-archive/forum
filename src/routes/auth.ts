import path from "path";
import { Router } from "express";
import { User } from "../interfaces/UserInt";
import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

const router = Router();
//authentication routes
router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname + "/../../views/register.html"));
});

router.post("/register", async (req, res) => {
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

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname + "/../../views/login.html"));
});

router.post("/login", async (req, res) => {
  const validUser = await User.findOne({ username: req.body.username });
  if (!validUser) return res.send("Invalid Username");
  const validPass = await bcrypt.compare(req.body.password, validUser.password);
  if (!validPass) return res.send("Invalid Password");
  res.redirect("/");
});

export default router;
