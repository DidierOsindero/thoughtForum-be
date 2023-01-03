import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  addNewPost,
  addNewUser,
  deletePostById,
  getAllArtPosts,
  getAllPosts,
  getAllSciencePosts,
  getAllThoughtPosts,
  INewPostData,
} from "./db";
import filePath from "./filePath";
import { isolateToken } from "./isAuthorised";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const PORT_NUMBER = process.env.PORT ?? 4000;

//============GET============

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

app.get("/posts", async (req, res) => {
  const posts = await getAllPosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
});

app.get("/thought", async (req, res) => {
  const posts = await getAllThoughtPosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
});

app.get("/science", async (req, res) => {
  const posts = await getAllSciencePosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
});

app.get("/art", async (req, res) => {
  const posts = await getAllArtPosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
});

app.get("/art", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

//============POST============
app.post<{}, {}, INewPostData>("/write", async (req, res) => {
  {
    const token = req.headers.authorization;
    if (token) {
      const createdUser = await addNewUser(isolateToken(token));
      const createdPost = await addNewPost(req.body, isolateToken(token));
      if (createdPost) {
        res.json(createdPost);
      } else {
        res.status(400);
      }
    }
  }
});

//============DELETE============
app.delete<{}, { postid: string }>("/profile/posts", async (req, res) => {
  const postid = Number(req.query.postid);
  {
    if (postid) {
      const deletedPost = await deletePostById(postid);
      if (deletedPost) {
        res.json(deletedPost);
      } else {
        res.status(400);
      }
    }
  }
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
