// api/posts.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'posts.json');

  try {
    const data = fs.readFileSync(filePath);
    const posts = JSON.parse(data);
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error reading posts.json:", error);
    res.status(500).json({ error: "Failed to load posts" });
  }
}