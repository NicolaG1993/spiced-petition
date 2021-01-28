exports.requireLoggedInUser = function (req, res, next) {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        res.redirect("/login");
    } else {
        next();
    }
};

exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect("/petition");
    }
    next();
};

exports.requireNoSignature = (req, res, next) => {
    if (req.session.signatureId) {
        res.redirect("/petition/thanks");
    } else {
        next();
    }
};

exports.requireSignature = (req, res, next) => {
    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

exports.dealWithCookieVulnerabilities = (req, res, next) => {
    res.set("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
};
