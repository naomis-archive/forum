import { PostInt } from "../src/interfaces/PostInt";

const postContainer: HTMLElement | any = document.getElementById("posts");

const getPosts = async () => {
  const data = await fetch("/posts");
  const parsedData = await data.json();
  parsedData.forEach((el: PostInt) => {
    postContainer.innerHTML += `<div class="post"><p class="title">${el.title}</p><p class="author">${el.author}</p><p class="date">${el.date}</p><p class="content">${el.content}</p></div>`;
  });
};

getPosts();
