import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  videoname: { type: String },
  videoUrl: { type: String },
});

const chapterSchema = new mongoose.Schema({
  chaptername: { type: String },
  videos: [videoSchema],
});

const contentSchema = new mongoose.Schema({
  name: { type: String },
  chapters: [chapterSchema],
});

websiteSchema = new mongoose.Schema({
  name: { type: String },
  contents: [contentSchema],
});
