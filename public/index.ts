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

const hideModal = () => {
  document
    .getElementById("modal-overlay")
    ?.setAttribute("style", "display: none");
  document.getElementById("new-reply")?.setAttribute("style", "display: none");
  document.getElementById("new-post")?.setAttribute("style", "display: none");
};

const getPosts = async () => {
  const data = await fetch("/posts");
  const parsedData = await data.json();
  parsedData.forEach((el: PostInt) => {
    let replyHTML = "";
    const deleteButton = `<form action="/delete/${el._id}" method="POST"><input type="password" name="adminpass" placeholder="Admin Password"> <button type="submit">Delete Post</button></form>`;
    const replyForm = `<button class="replybutton" id="${el._id}">Add Reply</button>`;
    el.replies.forEach((reply) => {
      replyHTML += `<hr><p class="reply-header nomargin"><span class="author">${reply.author}</span> - <span class="date">${reply.date}</span></p><p class="content">${reply.content}</p>`;
    });
    postContainer.innerHTML += `<div class="post"><p class="title">${el.title}</p><p class="nomargin"><span class="author">${el.author}</span> - <span class="date">${el.date}</span></p><p class="content">${el.content}</p>${replyHTML}<hr>${replyForm}${deleteButton}</div>`;
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
document
  .getElementById("modal-overlay")
  ?.addEventListener("click", () => hideModal());
