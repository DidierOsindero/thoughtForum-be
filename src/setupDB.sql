-- ------------------------------------------Users Table
DROP TABLE IF EXISTS users;
CREATE TABLE users(
  user_id varchar primary key,
  username varchar(20)
  );
  
-- ------------------------------------------User Posts Table
DROP TABLE IF EXISTS user_posts;
CREATE TABLE user_posts(
  post_id SERIAL PRIMARY KEY,
  user_id varchar NOT NULL REFERENCES users (user_id),
  title VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  img TEXT NOT NULL,
  category VARCHAR(20) NOT NULL,
  privacy VARCHAR(20) NOT NULL,
  hearts int DEFAULT 0,
  creation_date timestamp with time zone DEFAULT now()
  )

-- ------------------------------------------Hearts Table
DROP TABLE IF EXISTS hearts;
CREATE TABLE hearts(
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(user_id) NOT NULL,
  post_id INT REFERENCES user_posts(post_id) NOT NULL, 
  UNIQUE (user_id, post_id)
  );

-- ------------------------------------------Comments Table
DROP TABLE IF EXISTS comments;
CREATE TABLE comments(
  comment_id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(user_id) NOT NULL,
  post_id INT REFERENCES user_posts(post_id) NOT NULL,
  comment text,
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

-- ===========Create a view to get all public posts with the username of the author=========
-- DROP VIEW IF EXISTS user_posts_with_username;
-- CREATE VIEW user_posts_with_username AS
-- SELECT posts.post_id, posts.user_id, posts.title, posts.content, posts.img, posts.category, posts.privacy, posts.creation_date, users.username
-- FROM user_posts posts
-- JOIN users ON posts.user_id = users.user_id
-- ORDER BY creation_date DESC;

-- This is the user posts with username and hearts count for each post
CREATE VIEW user_posts_with_username AS
SELECT posts.post_id, posts.user_id, posts.title, posts.content, posts.img, posts.category, posts.privacy, posts.creation_date, users.username, COALESCE(sub_query.hearts, 0) AS hearts
FROM user_posts posts
JOIN users ON posts.user_id = users.user_id
LEFT JOIN (
  		SELECT h.post_id, COUNT(*) AS hearts
		FROM user_posts u
		RIGHT JOIN hearts h 
		ON h.post_id = u.post_id
  		GROUP BY h.post_id
  	) AS sub_query
ON sub_query.post_id = posts.post_id
ORDER BY creation_date DESC;