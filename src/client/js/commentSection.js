const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = (text) =>{
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className="fas fa-comment";
    const span = document.createElement("span");
    span.innerText = ` ${text}`
    newComment.appendChild(icon);
    newComment.appendChild(span);
    videoComments.prepend(newComment);
}

const handleSubmit = async(event) =>{
    event.preventDefault();
    const textArea = form.querySelector("textarea");
    const text = textArea.value;
    const videoId = videoContainer.dataset.id;
    if(text === ""){
        return;
    }
    //header은 기본적으로 request에 대한 정보를 담고있다.
    const response = await fetch(`/api/video/${videoId}/comment`,{
    //{status} = ~~~
        method:"POST",
        headers:{
            "Content-Type" : "application/json",
        },
        body: JSON.stringify({
            text,
        }),
    });
    textArea.value = "";
    if(response.status === 201){
        addComment(text);
    }
};

if(form){
form.addEventListener("submit", handleSubmit);
}