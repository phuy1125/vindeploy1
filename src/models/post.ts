import mongoose, { Document, Schema } from "mongoose";

// Định nghĩa interface cho Post
export interface IPost extends Document {
  title: string;
  content: string;
  author_id: mongoose.Types.ObjectId;
  locationRaw: string;
  provinceGid: number;
  timestamp: Date;
  status: "active" | "inactive" | "draft";
  tags: string[];
  media: string[];
  usersLiked: mongoose.Types.ObjectId[]; // Mảng chứa danh sách người dùng đã thích bài viết
  comments: mongoose.Types.ObjectId[]; // Mảng chứa danh sách comment ID
}

// Định nghĩa schema cho Post
const postSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    locationRaw: { type: String, required: true },
    provinceGid: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive", "draft"], default: "active" },
    tags: { type: [String], default: [] },
    media: { type: [String], default: [] },
    usersLiked: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] }, // Likes là mảng người dùng
    comments: { type: [mongoose.Schema.Types.ObjectId], ref: "Comment", default: [] }, // Comments là mảng comment ID
  },
  { timestamps: true }
);

// Tạo model từ schema
const Post = mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);

export default Post;
