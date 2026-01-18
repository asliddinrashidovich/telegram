const authControlller = require("../controller/authControlller");
const userController = require("../controller/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = require("express").Router();
require("express-group-routes");

// auth routes
router.post("/auth/login", authControlller.login)
router.post("/auth/verify", authControlller.verify)

// user routes
router.get("/user/messages/:contactId", userController.getMessages)
router.get("/user/contacts", userController.getContacts)

router.post("/user/message", userController.createMessage)
router.post("/user/contacts", userController.createContact)
router.post("/user/reaction", userController.createReaction)
router.post("/user/sent-otp", authMiddleware, userController.sentOtp)
router.post("/user/message-read", userController.messageRead)

router.put("/user/message/:messageId", userController.updateContact)
router.put("/user/profile", authMiddleware, userController.updateProfile)
router.put("/user/email", authMiddleware, userController.updateEmail)

router.delete("/user/message/:messageId", authMiddleware, userController.deleteMessage)
router.delete("/user/user/:userId", userController.deleteUser)

module.exports = router;
