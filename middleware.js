app.use((req, res, next) => {
    if (!req.session.userId && req.url != "register" && req.url != "/login") {
        res.redirect("/register");
    } else {
        next();
    }
});
