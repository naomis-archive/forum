import { PostInt } from "../src/interfaces/PostInt";

const postContainer: HTMLElement | any = document.getElementById("posts");

const getPosts = async () => {
  const data = await fetch("/posts");
  const parsedData = await data.json();
  parsedData.forEach((el: PostInt) => {
    let replyHTML = "";
    const deleteButton = `<form action="/delete/${el._id}" method="POST"><button type="submit">Delete Post</button></form>`;
    const replyForm = `<form action="/reply/${el._id}" method="POST"><input type="text" name="replyname" placeholder="Your Name"><textarea name="replycontent"></textarea><input type="submit"></form>`;
    el.replies.forEach((reply) => {
      replyHTML += `<hr><p class="reply-header">${reply.author} - ${reply.date}</p><p class="reply-content">${reply.content}</p>`;
    });
    postContainer.innerHTML += `<div class="post">${deleteButton}<p class="title">${el.title}</p><p class="author">${el.author}</p><p class="date">${el.date}</p><p class="content">${el.content}</p>${replyHTML}<hr>${replyForm}</div>`;
  });
};

const createPost = () => {
  document
    .getElementById("modal-overlay")
    ?.setAttribute("style", "display: block");
  document.getElementById("new-post")?.setAttribute("style", "display: block");
};
getPosts();