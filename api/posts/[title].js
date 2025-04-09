// api/posts/[title].js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const {
    query: { title }
  } = req;

  const filePath = path.join(process.cwd(), 'posts.json');

  try {
    const data = fs.readFileSync(filePath);
    const posts = JSON.parse(data);
    const post = posts.find(p => p.title.toLowerCase() === decodeURIComponent(title).toLowerCase());

    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    console.error("Error reading post:", error);
    res.status(500).json({ error: "Failed to load post" });
  }
}