import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  postUpload,
  getUpload,
  deleteVideo,
} from "../controllers/videoController";
import { protectorMiddleware, videoUpload } from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([a-f0-9]{24})", watch);
//숫자의 정규식 근데 데이터베이스에선 이런형식이 아님
videoRouter
  .route("/:id([a-f0-9]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route("/:id([a-f0-9]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);
// videoRouter.get("/:id(\\d+)/edit", getEdit);
// videoRouter.post("/:id(\\d+)/edit", postEdit);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );

export default videoRouter;
