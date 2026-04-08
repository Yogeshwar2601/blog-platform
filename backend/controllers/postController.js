import Post from "../models/Post.js";
import asyncHandler from "express-async-handler";

export const createPost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        const newPost = new Post({
            title,
            content,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(",")) : [],
            author: req.user._id,
            image: req.file ? req.file.path : null,
        });

        await newPost.save();

        res.status(201).json({ post: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getPosts = asyncHandler(async (req, res) => {
    const { keyword, tags, page = 1 } = req.query;

    const query = {};

    if (keyword) {
        query.$text = { $search: keyword };
    }

    if (tags) {
        query.tags = { $in: tags.split(",") };
    }

    const limit = 5;

    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
        .populate("author", "name email profilePic")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    res.json({
        posts,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        image: Post.image
    });
});

export const getPostById = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate("author", "name email");

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    res.json(post);
});

export const updatePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    if (post.author.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized");
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;

    const updatedPost = await post.save();

    res.json(updatedPost);
});

export const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    if (post.author.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized");
    }

    await post.deleteOne();

    res.json({ message: "Post removed" });
});

export const addComment = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    const comment = {
        user: req.user._id,
        text: req.body.text
    };

    post.comments.push(comment);
    await post.save();

    res.json(post.comments);
});

export const toggleLike = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
        post.likes = post.likes.filter(
            id => id.toString() !== req.user._id.toString()
        );
    } else {
        post.likes.push(req.user._id);
    }

    await post.save();

    res.json({ likes: post.likes.length });
});

export const getTrendingPosts = asyncHandler(async (req, res) => {
    const posts = await Post.aggregate([
        {
            $addFields: {
                likeCount: { $size: "$likes" }
            }
        },
        {
            $sort: { likeCount: -1 }
        },
        {
            $limit: 5
        }
    ]);

    res.json(posts);
});