import express, { Express } from "express";
import path from "path";
const app: Express = express();

const PORT = process.env.PORT || 3000;

app.use("/public", express.static(path.join(__dirname + "/../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/../views/index.html"));
});

app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
