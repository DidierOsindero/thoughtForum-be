import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();

const client = new Client(process.env.DATABASE_URL);
client.connect();

export interface DbItem {
  user_id: string;
  post_id: string;
  img: string;
  title: string;
  content: string;
  category: PostType;
  privacy: PostPrivacy;
  hearts: number;
  creation_date: string;
}

export type PostType = "thought" | "science" | "art";
export type PostPrivacy = "public" | "private";

export interface INewPostData {
  username: string | null;
  img: string | null;
  title: string;
  content: string;
  category: PostType | null;
  privacy: PostPrivacy | null;
}

export interface INewCommentData {
  post_id: string;
  commentText: string;
}

export interface ICommentDataWithUsername {
  text: string;
  creation_date: string;
  username: string;
}

//===========================GET==============================
export const getAllPosts = async () => {
  try {
    const queryText =
      "SELECT * FROM user_posts_with_username WHERE privacy = 'public';";
    const queryResponse = await client.query(queryText);
    const posts = queryResponse.rows;
    return posts;
  } catch (error) {
    console.error("There was an error getting all posts: ", error);
  }
};

export const getAllThoughtPosts = async () => {
  try {
    const queryText =
      "SELECT * FROM user_posts_with_username WHERE category = 'thought' AND privacy = 'public';";
    const queryResponse = await client.query(queryText);
    const posts = queryResponse.rows;
    return posts;
  } catch (error) {
    console.error("There was an error getting thought posts: ", error);
  }
};

export const getAllSciencePosts = async () => {
  try {
    const queryText =
      "SELECT * FROM user_posts_with_username WHERE category = 'science' AND privacy = 'public';";
    const queryResponse = await client.query(queryText);
    const posts = queryResponse.rows;
    return posts;
  } catch (error) {
    console.error("There was an error getting science posts: ", error);
  }
};

export const getAllArtPosts = async () => {
  try {
    const queryText =
      "SELECT * FROM user_posts_with_username WHERE category = 'art' AND privacy = 'public';";
    const queryResponse = await client.query(queryText);
    const posts = queryResponse.rows;
    return posts;
  } catch (error) {
    console.error("There was an error getting art posts: ", error);
  }
};

export const getAllUserPosts = async (userId: string) => {
  try {
    const queryText =
      "SELECT * FROM user_posts_with_username WHERE user_id = $1 ORDER BY creation_date DESC";
    const queryValues = [userId];
    const queryResponse = await client.query(queryText, queryValues);
    const userPosts = queryResponse.rows;
    return userPosts;
  } catch (error) {
    console.error("There was an error getting user posts: ", error);
  }
};

export const getFeaturedPosts = async () => {
  try {
    const queryText =
      "SELECT * FROM user_posts_with_username WHERE privacy = 'public' ORDER BY hearts DESC LIMIT 2";
    const queryResponse = await client.query(queryText);
    const userPosts = queryResponse.rows;
    if (userPosts.length > 0) {
      return userPosts;
    } else {
      return "Bad request";
    }
  } catch (error) {
    console.error("There was an error getting featured posts: ", error);
    return "Server error";
  }
};

export const getRecommendedPosts = async (
  category: string,
  postId: string,
  userId: string | null
) => {
  try {
    const queryText =
      userId !== null
        ? "SELECT * FROM user_posts_with_username WHERE category = $1 AND post_id != $2 AND privacy != 'private' AND user_id != $3 ORDER BY hearts DESC LIMIT 10"
        : "SELECT * FROM user_posts_with_username WHERE category = $1 AND post_id != $2 AND privacy != 'private' ORDER BY hearts DESC LIMIT 10";
    const queryValues = userId
      ? [category, postId, userId]
      : [category, postId];
    const queryResponse = await client.query(queryText, queryValues);
    const userPosts = queryResponse.rows;
    return userPosts;
  } catch (error) {
    console.error("There was an error getting recommended posts: ", error);
    return "Server error";
  }
};

export const getPostById = async (postId: string) => {
  try {
    const queryText =
      "SELECT * FROM user_posts_with_username WHERE post_id = $1";
    const queryValues = [postId];
    const queryResponse = await client.query(queryText, queryValues);
    const userPosts = queryResponse.rows;
    if (userPosts.length > 0) {
      return userPosts;
    } else {
      return "Bad request";
    }
  } catch (error) {
    console.error("There was an error getting post by ID: ", error);
    return "Server error";
  }
};

export const getCommentsByPost = async (postId: string) => {
  try {
    const query = `SELECT comment_id, post_id, comment, creation_date, c.user_id, username 
    FROM comments c 
    JOIN users u ON c.user_id = u.user_id
    WHERE post_id = $1
    ORDER BY creation_date DESC;`;
    const values = [postId];
    const response = await client.query(query, values);
    return response.rows;
  } catch (error) {
    console.error(
      `There was an error getting comments for post ${postId}:`,
      error
    );
  }
};

export const getHeartsByPost = async (userId: string, postId: string) => {
  try {
    const query = `SELECT * FROM hearts WHERE user_id = $1 AND post_id = $2`;
    const values = [userId, postId];
    const response = await client.query(query, values);

    if (response.rows[0]) return true;
    return false;
  } catch (error) {
    console.error(
      `There was an error getting current users heart for post ${postId}:`,
      error
    );
  }
};
//===========================DELETE==============================
export const deletePostById = async (postId: number) => {
  try {
    const queryText = "DELETE FROM user_posts WHERE post_id = $1 RETURNING *";
    const queryValues = [postId];
    const queryResponse = await client.query(queryText, queryValues);
    const posts = queryResponse.rows[0];
    return posts;
  } catch (error) {
    console.error("There was an error deleting your post: ", error);
  }
};

//===========================POST==============================
export const addNewUser = async (userId: string) => {
  try {
    console.log(userId);
    const addUserText = `INSERT INTO users (user_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING *;`;
    const addUserValues = [userId];
    const addUserValuesResponse = await client.query(
      addUserText,
      addUserValues
    );
    const createdUser = addUserValuesResponse.rows[0];
    return createdUser;
  } catch (error) {
    console.error(
      "There was an error when adding a new user to the database:",
      error
    );
  }
};

export const addNewUserWithUsername = async (
  userId: string,
  username: string
) => {
  try {
    console.log(userId);
    const addUserText = `INSERT INTO users (user_id, username) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *;`;
    const addUserValues = [userId, username];
    const addUserValuesResponse = await client.query(
      addUserText,
      addUserValues
    );
    const createdUser = addUserValuesResponse.rows[0];
    return createdUser;
  } catch (error) {
    console.error(
      "There was an error when adding a new user with username to the database:",
      error
    );
  }
};

export const addNewPost = async (newPostData: INewPostData, userId: string) => {
  try {
    client.query("BEGIN;");

    //===========Check if user has a username or not and add to DB accordingly===============
    if (newPostData.username) {
      addNewUserWithUsername(userId, newPostData.username);
    } else {
      addNewUser(userId);
    }

    const insertUserText =
      "INSERT INTO user_posts (user_id, title, content, img, category, privacy) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;";
    const insertUserValues = [
      userId,
      newPostData.title,
      newPostData.content,
      newPostData.img,
      newPostData.category,
      newPostData.privacy,
    ];
    const queryResponse = await client.query(insertUserText, insertUserValues);
    client.query("COMMIT;");
    const createdPost = queryResponse.rows[0];

    console.log(createdPost);
    return createdPost;
  } catch (error) {
    console.error(
      "There was an error when adding a new post to the database:",
      error
    );
  }
};

export const addNewComment = async (
  userId: string,
  postId: string,
  newCommentTxt: string
) => {
  try {
    const query =
      "INSERT INTO comments (user_id, post_id, comment) VALUES ($1, $2, $3) RETURNING *";
    const values = [userId, postId, newCommentTxt];
    const createdComment = await client.query(query, values);
    return createdComment;
  } catch (error) {
    console.error(
      "There was an error when adding a new comment to the database:",
      error
    );
  }
};

export const addNewHeart = async (userId: string, postId: string) => {
  try {
    const query =
      "INSERT INTO hearts (user_id, post_id) VALUES ($1, $2) RETURNING *";
    const values = [userId, postId];
    const createdHeart = await client.query(query, values);
    return createdHeart;
  } catch (error) {
    console.error(
      "There was an error when adding a new heart to the database:",
      error
    );
  }
};

export const deleteNewHeart = async (userId: string, postId: string) => {
  try {
    const query =
      "DELETE FROM hearts WHERE user_id = $1 AND post_id = $2 RETURNING *";
    const values = [userId, postId];
    const deletedHeart = await client.query(query, values);
    return deletedHeart;
  } catch (error) {
    console.error(
      "There was an error when adding a new heart to the database:",
      error
    );
  }
};
