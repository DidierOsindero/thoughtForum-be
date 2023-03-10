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
  user_id VARCHAR REFERENCES users(user_id),
  post_id INT REFERENCES user_posts(post_id),
  hearted BOOLEAN,
  PRIMARY KEY (user_id, post_id)
  );

-- ------------------------------------------Comments Table
DROP TABLE IF EXISTS comments;
CREATE TABLE comments(
  user_id VARCHAR REFERENCES users(user_id),
  post_id INT REFERENCES user_posts(post_id),
  comment text,
  PRIMARY KEY (user_id, post_id)
  );

-- ===========Create a view to get all public posts with the username of the author=========
CREATE VIEW get_posts_with_username AS
SELECT posts.post_id, posts.user_id, posts.title, posts.content, posts.img, posts.category, posts.privacy, posts.hearts, posts.creation_date, users.username
FROM user_posts posts
JOIN users ON posts.user_id = users.user_id
WHERE privacy = 'public' 
ORDER BY creation_date DESC;