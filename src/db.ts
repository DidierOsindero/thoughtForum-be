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
  type: PostType;
  privacy: PostPrivacy;
  hearts: number;
  creation_date: string;
}

export type PostType = "thought" | "science" | "art";
export type PostPrivacy = "public" | "private";

export interface INewPostData {
  img: string | null;
  title: string;
  content: string;
  type: PostType | null;
  privacy: PostPrivacy | null;
}

export const getAllPosts = async () => {
  try {
    const queryText = "SELECT * FROM user_posts";
    const queryResponse = await client.query(queryText);
    const posts = queryResponse.rows;
    return posts;
  } catch (error) {
    console.error("There was an error getting all posts: ", error);
  }
};

export const getAllThoughtPosts = async () => {
  try {
    const queryText = "SELECT * FROM user_posts WHERE category = 'thought' ";
    const queryResponse = await client.query(queryText);
    const posts = queryResponse.rows;
    return posts;
  } catch (error) {
    console.error("There was an error getting thought posts: ", error);
  }
};

export const getAllSciencePosts = async () => {
  try {
    const queryText = "SELECT * FROM user_posts WHERE category = 'science' ";
    const queryResponse = await client.query(queryText);
    const posts = queryResponse.rows;
    return posts;
  } catch (error) {
    console.error("There was an error getting science posts: ", error);
  }
};

export const getAllArtPosts = async () => {
  try {
    const queryText = "SELECT * FROM user_posts WHERE category = 'art' ";
    const queryResponse = await client.query(queryText);
    const posts = queryResponse.rows;
    return posts;
  } catch (error) {
    console.error("There was an error getting art posts: ", error);
  }
};

export const deletePostById = async (postId: number) => {
  try {
    const queryText = "DELETE FROM user_posts WHERE post_id = $1 RETURNING * ";
    const queryValues = [postId];
    const queryResponse = await client.query(queryText, queryValues);
    const posts = queryResponse.rows[0];
    return posts;
  } catch (error) {
    console.error("There was an error deleting your post: ", error);
  }
};

export const addNewPost = async (newPostData: INewPostData, userId: string) => {
  try {
    const queryText =
      "INSERT INTO user_posts (user_id, title, content, img, category, privacy) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    const queryValues = [
      userId,
      newPostData.title,
      newPostData.content,
      newPostData.img,
      newPostData.type,
      newPostData.privacy,
    ];
    const queryResponse = await client.query(queryText, queryValues);
    const createdPost = queryResponse.rows[0];

    return createdPost;
  } catch (error) {
    console.error(
      "There was an error when adding a new post to the database: ",
      error
    );
  }
};
