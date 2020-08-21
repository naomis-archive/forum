import { Document, Schema, model } from "mongoose";

export interface PostInt extends Document {
  title: string;
  author: string;
  date: string;
  content: string;
  replies: ReplyInt[];
}

interface ReplyInt {
  author: string;
  date: string;
  content: string;
}

export const PostSchema = new Schema({
  title: String,
  author: String,
  date: String,
  content: String,
  replies: Array,
});

export const Post = model<PostInt>("post", PostSchema);
