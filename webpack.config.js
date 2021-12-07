const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

console.log(path.resolve(__dirname, "assets", "js"));

const BASE_JS = "./src/client/js/";

module.exports = {
    entry:{ 
        main:BASE_JS+"main.js",
        videoPlayer: BASE_JS + "videoPlayer.js",
        recorder: BASE_JS + "recorder.js",
        commentSection: BASE_JS + "commentSection.js"
},
    mode: "development",
    watch: true,
    plugins: [new MiniCssExtractPlugin({
        filename: "css/styles.css"
    })],
    output: {
        filename: "js/[name].js",//이 프로퍼티에 우리 결과물이 될 파일 이름 입력
        path: path.resolve(__dirname,"assets"),//이 프로퍼티에 우리 결과물 파일을 어디에 저장할 지 지정 (이 경로는 절대경로여야함)
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [["@babel/preset-env", {targets: "defaults"}]],
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            }
        ],
    },
};