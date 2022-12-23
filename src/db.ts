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

const db: DbItem[] = [
  {
    user_id: "1",
    post_id: "1",
    title: "Why do we think the way we do?",
    content:
      "In their most common sense, the terms thought and thinking refer to conscious cognitive processes that can happen independently of sensory stimulation. Their most paradigmatic forms are judging, reasoning, concept formation, problem solving, and deliberation. But other mental processes, like considering an idea, memory, or imagination, are also often included. These processes can happen internally independent of the sensory organs, unlike perception.",
    img: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1664&q=80",
    type: "science",
    privacy: "public",
    hearts: 0,
    creation_date: "January 21 2023",
  },
  {
    user_id: "1",
    post_id: "2",
    title: "Why I'm scared of the future",
    content:
      "Fear is an intensely unpleasant emotion in response to perceiving or recognizing a danger or threat. Fear causes physiological changes that may produce behavioral reactions such as mounting an aggressive response or fleeing the threat. Fear in human beings may occur in response to a certain stimulus occurring in the present, or in anticipation or expectation of a future threat perceived as a risk to oneself.Fear is closely related to the emotion anxiety, which occurs as the result of threats that are perceived to be uncontrollable or unavoidable.[1] The fear response serves survival by engendering appropriate behavioral responses, so it has been preserved throughout evolution.[2] Sociological and organizational research also suggests that individuals' fears are not solely dependent on their nature but are also shaped by their social relations and culture, which guide their understanding of when and how much fear to feel.",
    img: "https://images.unsplash.com/photo-1670772295035-6baf4bf424ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDMyfHFQWXNEenZKT1ljfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
    type: "thought",
    privacy: "public",
    hearts: 0,
    creation_date: "January 21 2023",
  },
  {
    user_id: "1",
    post_id: "3",
    title: "When magic is deceptive",
    content:
      "In their most common sense, the terms thought and thinking refer to conscious cognitive processes that can happen independently of sensory stimulation. Their most paradigmatic forms are judging, reasoning, concept formation, problem solving, and deliberation. But other mental processes, like considering an idea, memory, or imagination, are also often included. These processes can happen internally independent of the sensory organs, unlike perception.",
    img: "https://images.unsplash.com/photo-1670787196366-11b4a82501e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDEyfHFQWXNEenZKT1ljfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
    type: "science",
    privacy: "public",
    hearts: 0,
    creation_date: "January 22 2023",
  },
  {
    user_id: "2",
    post_id: "4",
    title: "Hubris in Hamlet",
    content:
      "The Tragedy of Hamlet, Prince of Denmark, often shortened to Hamlet (/ˈhæmlɪt/), is a tragedy written by William Shakespeare sometime between 1599 and 1601. It is Shakespeare's longest play, with 29,551 words. Set in Denmark, the play depicts Prince Hamlet and his attempts to exact revenge against his uncle, Claudius, who has murdered Hamlet's father in order to seize his throne and marry Hamlet's mother.",
    img: "https://images.unsplash.com/photo-1553782749-5ab8693a5f4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8c2hha2VzcGVhcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
    type: "art",
    privacy: "public",
    hearts: 0,
    creation_date: "January 23 2023",
  },
  {
    user_id: "3",
    post_id: "5",
    title: "The beauty of silence",
    content:
      "In their most common sense, the terms thought and thinking refer to conscious cognitive processes that can happen independently of sensory stimulation. Their most paradigmatic forms are judging, reasoning, concept formation, problem solving, and deliberation. But other mental processes, like considering an idea, memory, or imagination, are also often included. These processes can happen internally independent of the sensory organs, unlike perception.",
    img: "https://images.unsplash.com/photo-1671557488735-1c5d99cfe045?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxNXx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60",
    type: "thought",
    privacy: "public",
    hearts: 0,
    creation_date: "January 24 2023",
  },
];

export const getAllPosts = async () => {
  return db;
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

// /** Variable to keep incrementing id of database items */
// let idCounter = 0;

// /**
//  * Adds in a single item to the database
//  *
//  * @param data - the item data to insert in
//  * @returns the item added (with a newly created id)
//  */
// export const addDbItem = (data: DbItem): DbItemWithId => {
//   const newEntry: DbItemWithId = {
//     id: ++idCounter,
//     ...data,
//   };
//   db.push(newEntry);
//   return newEntry;
// };
