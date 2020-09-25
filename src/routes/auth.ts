import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import path from "path";

const router = Router();
const seekrit = process.env.JWT || "null";

router.get("/signup", (_, res) => {
  res.sendFile(path.join(__dirname + "/../../views/register.html"));
});

router.get("/login", (_, res) => {
    res.sendFile(path.join(__dirname + "/../../views/login.html"));
})

router.post(
  "/signup",
  passport.authenticate("signup"),
  async (req, res) => {
    res.json({ message: "Signup successful!", user: req.user });
  }
);

router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error("An error occurred");
        return next(error);
      }
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        const body = { _id: user._id, username: user.username };
        const token = jwt.sign({ user: body }, seekrit);
        return res.json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

export default router;
