const { async } = require("regenerator-runtime");

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  const div = document.createElement("div");
  const xBtn = document.createElement("span");

  xBtn.classList.add("delete_comment");
  xBtn.innerText = "❌";
  span.innerText = ` ${text} `;
  div.appendChild(xBtn);
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(div);
  videoComments.prepend(newComment);
  xBtn.addEventListener("click", handleDeleteComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textArea = form.querySelector("textarea");
  const text = textArea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  //header은 기본적으로 request에 대한 정보를 담고있다.
  const response = await fetch(`/api/video/${videoId}/comment`, {
    //{status} = ~~~
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
    }),
  });
  textArea.value = "";
  const json = await response.json();
  console.log(json);
  if (response.status === 201) {
    addComment(text, json.newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
const handleDeleteComment = async (event) => {
  const comment = event.target.parentElement.parentElement;
  const commentId = comment.dataset.id;
  const response = await fetch(`/api/comments/${commentId}/delete`, {
    method: "DELETE",
  });
  if (response.status === 204) {
    comment.remove();
  }
};

const delete_comments = document.getElementsByClassName("delete_comment");
console.log(delete_comments);
if (delete_comments) {
  for (let i = 0; i < delete_comments.length; i++) {
    delete_comments[i].addEventListener("click", handleDeleteComment);
  }
}
