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

//===========================GET==============================
export const getAllPosts = async () => {
  try {
    const queryText = "SELECT * FROM get_posts_with_username;";
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
      "SELECT * FROM get_posts_with_username WHERE category = 'thought';";
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
      "SELECT * FROM get_posts_with_username WHERE category = 'science';";
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
      "SELECT * FROM get_posts_with_username WHERE category = 'art';";
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
      "SELECT * FROM user_posts WHERE user_id = $1 ORDER BY creation_date DESC";
    const queryValues = [userId];
    const queryResponse = await client.query(queryText, queryValues);
    const userPosts = queryResponse.rows;
    return userPosts;
  } catch (error) {
    console.error("There was an error getting user posts: ", error);
  }
};

export const getRecommendedPosts = async (category: string, postId: string) => {
  try {
    const queryText =
      "SELECT * FROM user_posts WHERE category = $1 AND post_id != $2 ORDER BY hearts DESC LIMIT 10";
    const queryValues = [category, postId];
    const queryResponse = await client.query(queryText, queryValues);
    const userPosts = queryResponse.rows;
    if (userPosts.length > 0) {
      return userPosts;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("There was an error getting recommended posts: ", error);
    return null;
  }
};

export const getPostById = async (postId: string) => {
  try {
    const queryText = "SELECT * FROM user_posts WHERE post_id = $1";
    const queryValues = [postId];
    const queryResponse = await client.query(queryText, queryValues);
    const userPosts = queryResponse.rows;
    if (userPosts.length > 0) {
      return userPosts;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("There was an error getting post by ID: ", error);
    return null;
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
