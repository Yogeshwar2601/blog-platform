import User from "../models/User.js";
import Post from "../models/Post.js";

export const toggleBookmark = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            return res.status(400).json({ message: "Post ID missing" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ ALWAYS force clean array
        let bookmarks = [];

        if (Array.isArray(user.bookmarks)) {
            bookmarks = user.bookmarks
                .map(id => id?.toString())
                .filter(id => id && id.length === 24); // valid ObjectId length
        }

        const index = bookmarks.indexOf(postId);

        if (index > -1) {
            bookmarks.splice(index, 1);
        } else {
            bookmarks.push(postId);
        }

        // ✅ Direct update (bypass mongoose casting issues)
        await User.updateOne(
            { _id: user._id },
            { $set: { bookmarks } }
        );
        console.log(user.bookmarks);
        return res.json({ bookmarks });


    } catch (error) {
        console.error("BOOKMARK ERROR:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate("followers", "name")
            .populate("following", "name");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const rawBookmarks = Array.isArray(user.bookmarks)
            ? user.bookmarks.filter(id => id && id.toString().length === 24)
            : [];

        const bookmarkedPosts = await Post.find({
            _id: { $in: rawBookmarks }
        }).populate("author", "name");

        const posts = await Post.find({ author: req.user._id })
            .populate("author", "name")
            .populate({
                path: "comments.user",
                select: "name"
            });

        res.json({
            user: {
                ...user.toObject(),
                bookmarks: bookmarkedPosts
            },
            posts
        });

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("followers", "name")
            .populate("following", "name");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const posts = await Post.find({ author: req.params.id })
            .populate("author", "name")
            .populate({
                path: "comments.user",
                select: "name"
            });

        res.json({ user, posts });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleFollow = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const alreadyFollowing = user.following.some(
            id => id.toString() === req.params.id
        );

        if (alreadyFollowing) {
            user.following = user.following.filter(
                id => id.toString() !== req.params.id
            );

            targetUser.followers = targetUser.followers.filter(
                id => id.toString() !== req.user._id.toString()
            );
        } else {
            user.following.push(targetUser._id);
            targetUser.followers.push(user._id);
        }

        await user.save();
        await targetUser.save();

        res.json({
            following: user.following,
            followers: targetUser.followers
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFollowers = async (req, res) => {
    const user = await User.findById(req.params.id).populate("followers", "name email");
    res.json(user.followers);
};

export const getFollowing = async (req, res) => {
    const user = await User.findById(req.params.id).populate("following", "name email");
    res.json(user.following);
};

export const updateProfilePic = async (req, res) => {
    try {
        console.log("file:", req.file);
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await User.findById(req.user._id);

        user.profilePic = req.file.path;
        await user.save();

        res.json({
            message: "Profile picture updated",
            profilePic: user.profilePic,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};