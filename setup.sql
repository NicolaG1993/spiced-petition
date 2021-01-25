DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    "First Name" VARCHAR NOT NULL CHECK ("First Name" != ''),
    "Last Name" VARCHAR NOT NULL CHECK ("Last Name" != ''),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE signatures (
    id SERIAL PRIMARY KEY, 
    "Signature" TEXT NOT NULL,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- INSERT INTO petition ("First Name", "Last Name", "Signature") 
-- VALUES ('Leonardo DiCaprio', 41, 1);

-- psql -d petition -f setup.sql