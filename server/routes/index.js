const authControlller = require("../controller/authControlller");

const router = require("express").Router();
require("express-group-routes");

router.post("/login", authControlller.login)
router.post("/verify", authControlller.verify)

module.exports = router;
