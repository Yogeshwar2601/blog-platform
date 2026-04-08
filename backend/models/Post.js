import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        tags: [String],

        likes: {
            type: Number,
            default: 0
        },

        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                text: {
                    type: String,
                    required: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        tags: [
            {
                type: String
            }
        ],

        image: {
            type: String
        }
    },
    { timestamps: true }
);

postSchema.index({ title: "text", content: "text" });
postSchema.index({ tags: 1 });

export default mongoose.model("Post", postSchema);
