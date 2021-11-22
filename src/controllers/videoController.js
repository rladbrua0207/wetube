import Video from "../models/Video";


/*
    Video.find({}, (error, videos) => {
    if(error){
        return res.render("server-error");
    }1
    return res.render("home", {pageTitle: "Home", videos});
});
*/

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({createdAt:"desc"});
  res.render("home", { pageTitle: "Home", videos });
  // console.log("hello");
  //logger은 request가 완성되면 출력이 됨 hello 출력 후 render과정을 거쳐야
  //logger를 얻게됨 render와 respond과정 이후에 error와 videos값을 얻음
};





//UPDATE
export const getEdit = async (req, res) => {//
  const { id } = req.params;
  const video = await Video.findById(id);
  if(!video){
    res.render("404", { pageTitle: "Video not found" });
  }
  res.render("edit", { pageTitle: `Edit ${video.title}`, video});
}; //form에 화면을 보여주는 녀석

export const postEdit = async (req, res) => {
  const { id } = req.params;

  const video = await Video.exists({_id: id});
  //const video = await Video.findById(id);

  const {title, description, hashtags} = req.body;
  if(!video){
    return res.render("404", {pageTitle: "Video not found."})
  }
  await Video.findByIdAndUpdate(id,{
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  })

  //video.title = title;
  //video.description = description;
  //video.hashtags =  hashtags.split(",").map((word) =>word.startsWith("#") ? word :`#${word}`);
  //await video.save();
  return res.redirect(`/videos/${id}`);
};
//변경사항을 저장해주는 녀석



//CREATE
export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "upload Video" });
};

export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      //const video = new Video --1
      title,
      description,
      hashtags:Video.formatHashtags(hashtags) ,
    });
    console.log(1);
    //const dbVideo = await video.save(); --2
    return res.redirect("/");
  } catch (error) {
    console.log(error,1);
    return res.render("upload",{
      pageTitle: "upload Video",
      errorMessage: error._message,
      
    })
  }
};




//DELETE
export const deleteVideo = async (req,res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  //findOneAndDelete({{_id: id}}) 를 줄인것
  console.log(id);
  return res.redirect("/");
}



//READ
export const watch = async (req, res) => {
  const { id } = req.params; 
  //const video = await Video.exists({_id:id});
  const video = await Video.findById(id);
  if(video===null){
    return res.render("404", { pageTitle: "Video not found" });
  }

  return res.render("watch", {pageTitle: video.title, video})
};

export const search = async (req, res) =>{
  const {keyword} = req.query;
  let videos = [];

  if(keyword){
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i")
      },
    })
    console.log(videos);
  }
  return res.render("search",{pageTitle: "Search", videos});
}

