const { Router } = require("express");
const route = Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

route.post("/auth/register", userController.register);
route.post("/auth/activation", userController.activate);
route.post("/auth/signing", userController.signing);
route.post("/auth/access", userController.access);
route.post("/auth/forgot_pass", userController.forgot);
route.post("/auth/reset_pass", auth, userController.reset);
route.get("/auth/user", auth, userController.info);
route.patch("/auth/user_update", auth, userController.update);
route.get("/auth/signout", userController.signout);
route.get('/profile', auth, userController.getUserProfile);
route.get('/leaderboard', userController.getLeaderboard);
route.get('/checkStreaks', auth, userController.checkStreaks);

module.exports = route;
