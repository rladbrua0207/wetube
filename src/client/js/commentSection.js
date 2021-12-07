const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");


const handleSubmit = (event) =>{
    event.preventDefault();
    const textArea = form.querySelector("textarea");
    const text = textArea.value;
    const videoId = videoContainer.dataset.id;
    fetch(`/api/video/${videoId}/comment`,{
        method:"POST",
        body: {
            text
        }
    })
}

if(form){
form.addEventListener("submit", handleSubmit);
}