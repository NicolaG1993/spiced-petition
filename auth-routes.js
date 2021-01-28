const { requireLoggedOutUser } = require("./middleware");
const { app } = require("./server");

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.sendStatus(200);
});

app.post("/register", requireLoggedOutUser, (req, res) => {
    res.sendStatus(200);
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.sendStatus(200);
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    res.sendStatus(200);
});
