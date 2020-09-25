import express, { Express } from "express";
import path from "path";
import mongoose, { Mongoose } from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import helmet from "helmet";
import mainRoutes from "./routes/main";
import postRoutes from "./routes/posts";

//config environment variables
dotenv.config();
const app: Express = express();
const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO_URI || "";

//database connection
mongoose
  .connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected!"));

//mount the middleware!
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//serve static assets
app.use("/public", express.static(path.join(__dirname + "/../public")));

//use routes
app.use(mainRoutes);
app.use(postRoutes);

app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
