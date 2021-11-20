import "./db";//mongo 연결
import "./models/Video";
import express from "express";//node_modules에서 express찾는거
import morgan from "morgan";
//const express = require("express");

import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";


const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
//너의 express application가 form의 value들을 이해할수 있도록 하고 우리가 쓸 수 있는 멋진 자바스크립트 형식으로 변형시켜 준다
app.use(logger);
app.use(express.urlencoded({extended: true}));
app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;