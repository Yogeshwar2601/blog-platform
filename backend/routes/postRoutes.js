import express from "express";
import upload from "../utils/multer.js";

import {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    addComment,
    toggleLike,
    getTrendingPosts
} from "../controllers/postController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), createPost);

router.get("/", getPosts);
router.get("/trending", getTrendingPosts);
router.get("/:id", getPostById);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/comment", protect, addComment);
router.put("/:id/like", protect, toggleLike);

export default router;