import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;
let timeoutId;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);

  actionBtn.innerText = "Trnadcoding...";
  actionBtn.disabled = true;
  const ffmpeg = createFFmpeg({
    corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
    log: true,
  });
  //corePath: "/static/ffmpeg-core.js",
  //corepath는 버전이 강의버전과 안맞아서 오류때문에
  //무슨일이 벌어지는지 콘솔에서 확인하기 위해  log:true
  await ffmpeg.load();
  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
  //writeFile은 ffmpeg의 가상의 세계에 파일을 생성해준다
  await ffmpeg.run("-i", files.input, "-r", "60", "output.mp4");
  //ffmpeg.run은 가상 컴퓨터에 이미 존재하는 파일을 input(-i)으로 받는거
  //그런 다음 output으로 recording.webm이 ouput.mp4로 변환
  //-r, 60은 초당 60프레임으로 인코딩해주는 명령어

  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );
  //-ss는 영상의 특정 시간대로 갈 수 있게 해줌,
  //"-frames:v", "1" 는 첫 프레임의 스크린샷을 찍어줌
  //그냥 이동한 시간의 스크린샷 한장을 찍는다고 이해
  //input으로 recording.webm 을 주고 output으로 thumbnail.jpg줌

  //이 두 파일은 파일시스템(FS)의 메모리에 만들어지는거

  const mp4File = ffmpeg.FS("readFile", files.output);
  //ffmpeg의 FS(파일 시스템)을 이용해 mp4파일 가져오기
  //데이터가 몇십만개의 배열로 나옴 이거로는 아무것도 할 수 없어서
  //blob(binary정보를 가지고있는 파일)활용, 배열로 blob 만들기
  //근데 uint8array 로는 blob를 못만들고 ArrayBuffer로 만들수 있음
  //그냥 쉽게 binary data를 사용하고 싶으면 buffer를 사용해야하는거
  const thumbFile = ffmpeg.FS("readFile", files.thumb);
  //readFile의 return값은 Uint8Array(unsigned integer)

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRocording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
  //취소하고싶은 url 객체를 메모리에서 지우는거
};
const handleStop = () => {
  clearTimeout(timeoutId);
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);

  recorder.stop();
};

const handleStart = () => {
  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStart);
  actionBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    videoFile = URL.createObjectURL(e.data);
    //e.data : blob(?)
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
  timeoutId = setTimeout(() => {
    handleStop();
  }, 5000);
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  video.srcObject = stream;
  video.play();
};

init();

actionBtn.addEventListener("click", handleStart);
