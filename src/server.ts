import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  addNewPost,
  getAllArtPosts,
  getAllPosts,
  getAllSciencePosts,
  getAllThoughtPosts,
  INewPostData,
} from "./db";
import filePath from "./filePath";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const PORT_NUMBER = process.env.PORT ?? 4001;

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
    if (req.headers.authorization) {
      const createdPost = await addNewPost(req.body, req.headers.authorization);
      if (createdPost) {
        res.json(createdPost);
      } else {
        res.status(400);
      }
    }
  }
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
