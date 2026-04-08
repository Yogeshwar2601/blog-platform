import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { fileURLToPath } from "url";
import path from "path";
dotenv.config();
import './config/cloudinary.js';

const app = express();
// middleware
app.use(express.json());
app.use(cors({
    origin: "blog-platform-oisqskr36-yogeshwars-projects-79f9a555.vercel.app",
    credentials: true,
}));
app.use(errorHandler);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

// test route
app.get("/", (req, res) => {
    res.send("API running...");
});

// connect DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
