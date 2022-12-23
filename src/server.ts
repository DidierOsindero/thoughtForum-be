import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { addNewPost, getAllPosts, INewPostData } from "./db";
import filePath from "./filePath";

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
  res.json(posts);
});

app.get("/thought", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

app.get("/science", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
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
