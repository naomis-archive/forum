import { Router } from "express";
import path from "path";

const router = Router();

//homepage
router.get("/", (_, res) => {
  res.sendFile(path.join(__dirname + "/../../views/index.html"));
});

//welcome page
router.get("/welcome", (_, res) => {
  res.sendFile(path.join(__dirname + "/../../views/welcome.html"));
});

//agree route
router.get("/agree", (_, res) => {
  res.redirect("/register");
});

export default router;
