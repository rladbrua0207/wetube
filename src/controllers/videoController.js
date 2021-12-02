import User from "../models/User";
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
  const videos = await Video.find({}).sort({createdAt:"desc"}).populate("owner");
  res.render("home", { pageTitle: "Home", videos });
  // console.log("hello");
  //logger은 request가 완성되면 출력이 됨 hello 출력 후 render과정을 거쳐야
  //logger를 얻게됨 render와 respond과정 이후에 error와 videos값을 얻음
};





//UPDATE
export const getEdit = async (req, res) => {//
  const {
    params:{ id },
    session:{user: {_id}}
  } =req;
  const video = await Video.findById(id);
  if(!video){
    res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if(String(video.owner) !== String(_id)){
    return res.status(403).redirect("/");
  }

  res.render("edit", { pageTitle: `Edit ${video.title}`, video});
}; //form에 화면을 보여주는 녀석

export const postEdit = async (req, res) => {

  const {
    params:{ id },
    session:{user: {_id}}
  } =req;
  const video = await Video.findById(id);

  //const video = await Video.exists({_id: id});
  
  const {title, description, hashtags} = req.body;
  if(!video){
    return res.status(404).render("404", {pageTitle: "Video not found."})
  }
  if(String(video.owner) !== String(_id)){
    return res.status(403).redirect("/");
  }
  console.log("id",id);
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
  const {
    file:{
      path:fileUrl
    },
    body:{
      title, description, hashtags,
    },
    session:{
      user: {_id},
    }
} = req;
  try {
    const newVideo = await Video.create({
      //const video = new Video --1
      title,
      description,
      fileUrl,
      owner: _id,
      hashtags:Video.formatHashtags(hashtags) ,
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
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
  const {
    params:{ id },
    session:{user: {_id}}
  } =req;
  const video = await Video.findById(id);
  const user = await User.findById(_id);
  if(!video){
    return res.status(404).render("404", {pageTitle: "Video not found."})
  }
  if(String(video.owner) !== String(_id)){
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  //findOneAndDelete({{_id: id}}) 를 줄인것
  user.videos.splice(user.videos.indexOf(id),1);
  user.save();
  return res.redirect("/");
}



//READ
export const watch = async (req, res) => {
  const { id } = req.params; 
  //const video = await Video.exists({_id:id});
  const video = await Video.findById(id).populate("owner");
  //const owner = await User.findById(video.owner);
  if(video===null){
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  //console.log(video.owner);
  
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
    }).populate("owner");
    console.log(videos);
  }
  return res.render("search",{pageTitle: "Search", videos});
}

