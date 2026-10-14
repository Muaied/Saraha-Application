import express from "express";
const app = express();
import cors from "cors";
import helmet from "helmet";

import {
  authenticationController,
  userController,
  messageController
} from "./modules/index.js";
import { connectDB } from "./DB/db.js";
import { globalErrorHandling } from "./middleware/error.middleware.js";
import { ORIGINS, PORT } from "./config.js";
import { set } from "./common/services/cache.service.js";
import { generateRateLimiter } from "./common/utils/limiter.js";
import morgan from "morgan";

//DB connection
await connectDB(app, PORT);

// await set({ key: "name", value: "muaied", ttl: 60 })
await set({ key: "gender", value: { gender: "male" } })

var corsOptopns = {
  origin: function (origin, callback) {
    if (!ORIGINS.includes(origin)) {
      callback(new Error("unauthorized origin", { cause: { status: 401 } }), ORIGINS)
    } else {
      callback(null, ORIGINS)
    }
  }



}



const limiter = generateRateLimiter({ limit: 1000 })
app.set("trust proxy", true);
//appliction-level-middleware
app.use(helmet(), morgan("common"), cors(), limiter, express.json());

app.use('/assets', express.static('./assets'))

//appliction routing
app.get("/", async (req, res, next) => {
  return res.json({ message: "welcome to my API" });
});
app.use("/auth", authenticationController);
app.use("/user", userController);
app.use("/message", messageController);

app.all("{/*dummy}", (req, res, next) => {
  return res.status(404).json({ message: "Invalid application routing" });
});
app.use(globalErrorHandling);

