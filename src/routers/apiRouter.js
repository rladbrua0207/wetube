import express from "express";
import {
  createComment,
  deleteComment,
  registerView,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([a-f0-9]{24})/view", registerView);
apiRouter.post("/video/:id([a-f0-9]{24})/comment", createComment);
apiRouter.delete("/comments/:id([a-f0-9]{24})/delete", deleteComment);

export default apiRouter;
