DROP TABLE IF EXISTS petition;

CREATE TABLE petition (
    id SERIAL PRIMARY KEY,
    "First Name" VARCHAR NOT NULL CHECK ("First Name" != ''),
    "Last Name" VARCHAR NOT NULL CHECK ("Last Name" != ''),
    "Signature" VARCHAR NOT NULL CHECK ("Signature" != '')
);


-- INSERT INTO petition ("First Name", "Last Name", "Signature") 
-- VALUES ('Leonardo DiCaprio', 41, 1);

-- psql -d petition -f setup.sql