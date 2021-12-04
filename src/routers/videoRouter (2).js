import express from "express";
import { watch, getEdit , postEdit, postUpload, getUpload, deleteVideo } from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.get("/:id([a-f0-9]{24})", watch);
//숫자의 정규식 근데 데이터베이스에선 이런형식이 아님
videoRouter.route("/:id([a-f0-9]{24})/edit").get(getEdit).post(postEdit);
videoRouter.route("/:id([a-f0-9]{24})/delete").get(deleteVideo);
// videoRouter.get("/:id(\\d+)/edit", getEdit); 
// videoRouter.post("/:id(\\d+)/edit", postEdit);
videoRouter.route("/upload").get(getUpload).post(postUpload);


export default videoRouter;