DROP TABLE IF EXISTS petition;

CREATE TABLE petition (
    id SERIAL PRIMARY KEY,
    "First Name" VARCHAR NOT NULL CHECK ("First Name" != ''),
    "Last Name" VARCHAR NOT NULL CHECK ("Last Name" != ''),
    "Signature" VARCHAR NOT NULL CHECK ("Signature" != '')
);


-- INSERT INTO petition ("Name", "Age", "Number of Oscars") 
-- VALUES ('Leonardo DiCaprio', 41, 1);