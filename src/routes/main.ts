import { Router } from "express";
import connectEnsureLogin from "connect-ensure-login";
import path from "path";

const router = Router();
//main page route
router.get("/", (req, res) => {
  connectEnsureLogin.ensureLoggedIn();
  res.sendFile(path.join(__dirname + "/../../views/index.html"));
});

//get landing page
router.get("/welcome", (req, res) => {
  res.sendFile(path.join(__dirname + "/../../views/welcome.html"));
});

export default router;
