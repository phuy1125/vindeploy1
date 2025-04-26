import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IThread extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ThreadSchema: Schema<IThread> = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, default: "New Conversation" },
    messages: [
      {
        role: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Thread: Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>("Thread", ThreadSchema);

export default Thread;
