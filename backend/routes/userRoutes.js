import express from "express";
import { toggleBookmark, getUserProfile, toggleFollow, getFollowers, getFollowing, getUserById, updateProfilePic } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.put("/bookmark/:postId", protect, toggleBookmark);
router.get("/profile", protect, getUserProfile);
router.put("/follow/:id", protect, toggleFollow);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);
router.get("/profile/:id", protect, getUserById);
router.put(
    "/profile-pic",
    (req, res, next) => {
        next();
    },
    protect,
    upload.single("image"),
    updateProfilePic
);

export default router;