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
  addNewComment,
  addNewPost,
  deletePostById,
  getAllArtPosts,
  getAllPosts,
  getAllSciencePosts,
  getAllThoughtPosts,
  getAllUserPosts,
  getCommentsByPost,
  getFeaturedPosts,
  getPostById,
  getRecommendedPosts,
  INewCommentData,
  INewPostData,
} from "./db";
import { checkIsAuthenticated } from "./checkIsAuthenticated";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const PORT_NUMBER = process.env.PORT ?? 4000;

//============GET============

//--------------------------------------------------------------------GET All Posts
app.get("/posts", async (req, res) => {
  console.log("GET all posts", new Date());
  const posts = await getAllPosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
  console.log("FINISH get all posts", new Date());
});

app.get("/posts/thought", async (req, res) => {
  console.log("get /posts/thought", new Date());

  const posts = await getAllThoughtPosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
  console.log("FINISH get /posts/thought", new Date());
});

app.get("/posts/science", async (req, res) => {
  console.log("get /posts/science", new Date());

  const posts = await getAllSciencePosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
  console.log("FINISH get /posts/science", new Date());
});

app.get("/posts/art", async (req, res) => {
  console.log("get /posts/art", new Date());
  const posts = await getAllArtPosts();
  if (posts) {
    res.json(posts);
  } else {
    res.status(400);
  }
  console.log("FINISH get /posts/art", new Date());
});

//--------------------------------------------------------------------GET Featured Posts
app.get("/posts/feature", async (req, res) => {
  console.log("get /posts/feature/", new Date());
  const response = await getFeaturedPosts();
  if (response !== "Bad request" && response !== "Server error") {
    res.json(response);
  } else if (response === "Bad request") {
    console.log("Bad request to getting featured posts.");
    res.status(400).send("Bad request to getting featured posts.");
  } else if (response === "Server error") {
    console.log("Server error when getting featured posts.");
    res.status(400).send("Server error when getting featured posts.");
  }
  console.log("FINISH get /posts/feature/", new Date());
});
//--------------------------------------------------------------------GET Recommended Posts by Category
app.get<{ category: string; postid: string }>(
  "/posts/recommend/:category/:postid",
  async (req, res) => {
    console.log("get /posts/recommend/:category", new Date());

    let userId = null;
    if (req.headers.authorization) {
      const authenticationResult = await checkIsAuthenticated(req, res);
      userId =
        authenticationResult.authenticated &&
        authenticationResult.decodedToken?.uid
          ? authenticationResult.decodedToken?.uid
          : null;
    }

    const response = await getRecommendedPosts(
      req.params.category,
      req.params.postid,
      userId
    );
    if (response !== "Server error") {
      res.json(response);
    } else if (response === "Server error") {
      console.log("Server error when getting recommended posts.");
      res.status(500).send("Server error when getting recommended posts.");
    }
    console.log("FINISH get /posts/recommend/:category", new Date());
  }
);
//--------------------------------------------------------------------GET Profile Posts
app.get("/posts/profile", async (req, res) => {
  console.log("get /profile/posts", new Date());
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
  console.log("FINISH get /profile/posts", new Date());
});
//------------------------------------------------------------------------GET Posts by ID
app.get<{ id: string }>("/posts/:id", async (req, res) => {
  console.log("get /posts/:id", new Date());
  const response = await getPostById(req.params.id);
  if (response !== "Bad request" && response !== "Server error") {
    res.json(response);
  } else if (response === "Bad request") {
    console.log("Bad request to get post by id, post does not exist.");
    res.status(400).send("Bad request to get post by id, post does not exist.");
  } else if (response === "Server error") {
    console.log("Server error when getting post by id.");
    res.status(500).send("Server error when getting post by id.");
  }
  console.log("FINISH get /posts/:id", new Date());
});

//------------------------------------------------------------------------GET Comments by post ID
app.get<{ id: string }>("/posts/:id/comments", async (req, res) => {
  console.log("Get /posts/comments", new Date());
  const response = await getCommentsByPost(req.params.id);
  if (response) {
    res.json(response);
  } else {
    res.status(500).send("Server error when getting comments by post id.");
  }
  console.log("FINISH Get /posts/comments", new Date());
});

//============POST============
//------------------------------------------------------------------------POST User Post
app.post<{}, {}, INewPostData>("/posts", async (req, res) => {
  console.log("Post to /posts", new Date());
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
  console.log("FINISH Post to /posts", new Date());
});

//------------------------------------------------------------------------POST User Comment
app.post<{}, {}, INewCommentData>("/posts/comments", async (req, res) => {
  console.log("Post to /comments", new Date());
  const authenticationResult = await checkIsAuthenticated(req, res);

  //================Check if the user is verified by Firebase and has a userID================
  if (
    authenticationResult.authenticated &&
    authenticationResult.decodedToken?.uid
  ) {
    const userId = authenticationResult.decodedToken?.uid;
    const createdComment = await addNewComment(
      userId,
      req.body.post_id,
      req.body.commentText
    );
    if (createdComment) {
      res.json(createdComment?.rows[0]);
    } else {
      res
        .status(500)
        .send("Token was verified but there was a server side error");
    }
  } else {
    res.status(401).send({ message: authenticationResult.message });
  }
  console.log("FINISH Post to /comments", new Date());
});

//============DELETE============
//------------------------------------------------------------------------DELETE User Post

app.delete<{}, {}, {}, { postid: string }>(
  "/posts/profile",
  async (req, res) => {
    console.log("delete /posts/profile", new Date());
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
    console.log("FINISH delete /profile/posts", new Date());
  }
);

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
