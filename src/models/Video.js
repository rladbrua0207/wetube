import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 }, // title: {type: String}
  description: { type: String, required: true, trim: true, minlength: 20 }, // description: {type: String}
  createdAt: { type: Date, required: true, default: Date.now },
  //Date.now()안하는 이유는 데베에서 알아서 해줌
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
    //required는 defalut값이 있으면 무쓸모긴함
  },
});


  videoSchema.static("formatHashtags", function (hashtags) {
    return hashtags
      .split(",")
      .map((word) => (word.startsWith("#") ? word : `#${word}`));
  });
  //export const formatHashtags = (hashtags) =>
  //hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));

  

const Video = mongoose.model("Video", videoSchema); //movieModel

export default Video;



