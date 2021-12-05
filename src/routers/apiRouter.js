import express from "express";
import { registerView } from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([a-f0-9]{24})/view", registerView);

export default apiRouter;