//======================FIREBASE=================
if (process.env.NODE_ENV === "production") {
  //=====Default location for render.com secret files is /etc/secrets/<filename>====
  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    "/etc/secrets/firebase-service-account-secrets.json";
} else {
  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    "secrets/firebase-service-account-secrets.json";
}
import { initializeApp } from "firebase-admin/app";
//=========This will only ever contain filename, not actual credentials========
console.log(
  "process.env.GOOGLE_APPLICATION_CREDENTIALS:",
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);
initializeApp();
//======================EXPRESS=================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  addNewPost,
  deletePostById,
  getAllArtPosts,
  getAllPosts,
  getAllSciencePosts,
  getAllThoughtPosts,
  getAllUserPosts,
  getPostById,
  getRecommendedPosts,
  INewPostData,
} from "./db";
import filePath from "./filePath";
import { checkIsAuthenticated } from "./checkIsAuthenticated";

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
  console.log("GET all posts");
  const posts = await getAllPosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
});

app.get("/posts/thought", async (req, res) => {
  const posts = await getAllThoughtPosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
});

app.get("/posts/science", async (req, res) => {
  const posts = await getAllSciencePosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
});

app.get("/posts/art", async (req, res) => {
  const posts = await getAllArtPosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
});
//--------------------------------------------------------------------Get Recommended Posts by Category
app.get<{ category: string }>(
  "/posts/recommend/:category",
  async (req, res) => {
    const posts = await getRecommendedPosts(req.params.category);
    if (posts) {
      res.json(posts);
    } else {
      res.status(400);
    }
  }
);
//------------------------------------------------------------------------Get Posts by ID
app.get<{ id: string }>("/posts/:id", async (req, res) => {
  const post = await getPostById(req.params.id);
  if (post) {
    res.json(post);
  } else if (post === undefined) {
    console.log("Bad request to get post by id, post does not exist.");
    res.status(400).send("Bad request to get post by id, post does not exist.");
  } else if (post === null) {
    console.log("Server error when getting post by id.");
    res.status(400).send("Server error when getting post by id.");
  }
});

app.get("/profile/posts", async (req, res) => {
  const authenticationResult = await checkIsAuthenticated(req, res);
  console.log("/profile/posts AUTH", authenticationResult);

  //Check if the user is verified by Firebase and has a userID
  if (
    authenticationResult.authenticated &&
    authenticationResult.decodedToken?.uid
  ) {
    try {
      const userId = authenticationResult.decodedToken?.uid;
      const userPosts = await getAllUserPosts(userId);
      res.json(userPosts);
    } catch (error) {
      console.error("There was an error when getting all user posts:", error);
      res
        .status(500)
        .send("Token was verified but there was a server side error");
    }
  } else {
    res.status(401).send({ message: authenticationResult.message });
  }
});

//============POST============

app.post<{}, {}, INewPostData>("/write", async (req, res) => {
  console.log("Post to /write", new Date());
  const authenticationResult = await checkIsAuthenticated(req, res);

  //================Check if the user is verified by Firebase and has a userID================
  if (
    authenticationResult.authenticated &&
    authenticationResult.decodedToken?.uid
  ) {
    try {
      const userId = authenticationResult.decodedToken?.uid;
      const createdPost = await addNewPost(req.body, userId);
      res.json(createdPost);
    } catch (error) {
      console.error(
        "There was an error when posting a new post to the database:",
        error
      );
      res
        .status(500)
        .send("Token was verified but there was a server side error");
    }
  } else {
    res.status(401).send({ message: authenticationResult.message });
  }
});

//============DELETE============
app.delete<{}, {}, {}, { postid: string }>(
  "/profile/posts",
  async (req, res) => {
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
  }
);

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
