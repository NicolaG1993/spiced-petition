const express = require("express");
const router = express.Router();

router.get("/profile", (req, res) => {
    res.sendStatus(200);
});

router.post("/profile", (req, res) => {
    res.sendStatus(200);
});

router.get("/profile/edit", (req, res) => {
    res.sendStatus(200);
});

router.post("/profile/edit", (req, res) => {
    res.sendStatus(200);
});

exports.router = router;
