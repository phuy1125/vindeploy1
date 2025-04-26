import mongoose, {
  type Document,
  type Model,
  Schema,
  type Types,
} from "mongoose";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  threadId: Types.ObjectId;
  role: string;
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<IMessage> = new mongoose.Schema(
  {
    threadId: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
    role: { type: String, required: true, enum: ["user", "ai"] },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
