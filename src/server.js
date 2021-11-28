import "./db";//mongo 연결
import "./models/Video";
import session from "express-session";
import express from "express";//node_modules에서 express찾는거
import morgan from "morgan";
//const express = require("express");
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";


const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
//너의 express application가 form의 value들을 이해할수 있도록 하고 우리가 쓸 수 있는 멋진 자바스크립트 형식으로 변형시켜 준다
app.use(logger);
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret:process.env.COOKIE_SECRET,
    resave:true,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl:process.env.DB_URL})
}))


app.use((req, res, next) => {
    req.sessionStore.all((error,sessions) =>{
        //console.log(sessions);
        next();
    })
})
// app.get("/add-one", (req,res,next) =>{
//     req.session.potato += 1;
//     return res.send(`${req.session.id} \n ${req. session.potato}`);
// });
app.use(localsMiddleware)
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;