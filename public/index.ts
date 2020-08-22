import { PostInt } from "../src/interfaces/PostInt";

const postContainer: HTMLElement | any = document.getElementById("posts");
const createButton: HTMLElement | any = document.getElementById("createpost");

const createPost = () => {
  document
    .getElementById("modal-overlay")
    ?.setAttribute("style", "display: block");
  document.getElementById("new-post")?.setAttribute("style", "display: block");
};

const createReply = (id: string) => {
  document
    .getElementById("modal-overlay")
    ?.setAttribute("style", "display: block");
  document.getElementById("new-reply")?.setAttribute("style", "display: block");
  document.getElementById("replyform")?.setAttribute("action", `/reply/${id}`);
};

const getPosts = async () => {
  const data = await fetch("/posts");
  const parsedData = await data.json();
  parsedData.forEach((el: PostInt) => {
    let replyHTML = "";
    const deleteButton = `<form action="/delete/${el._id}" method="POST"><button type="submit">Delete Post</button></form>`;
    const replyForm = `<button class="replybutton" id="${el._id}">Add Reply</button>`;
    el.replies.forEach((reply) => {
      replyHTML += `<hr><p class="reply-header">${reply.author} - ${reply.date}</p><p class="reply-content">${reply.content}</p>`;
    });
    postContainer.innerHTML += `<div class="post">${deleteButton}<p class="title">${el.title}</p><p class="author">${el.author}</p><p class="date">${el.date}</p><p class="content">${el.content}</p>${replyHTML}<hr>${replyForm}</div>`;
    document
      .getElementById(el._id as string)
      ?.addEventListener("click", () => createReply(el._id as string));
  });
};

getPosts().then(() => {
  const replies = document.getElementsByClassName("replybutton");
  for (let i = 0; i < replies.length; i++) {
    replies[i].addEventListener("click", () => createReply(replies[i].id));
  }
});
createButton.addEventListener("click", () => createPost());
