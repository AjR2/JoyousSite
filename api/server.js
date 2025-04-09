const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ✅ Load blog posts from JSON file
const postsFilePath = path.join(__dirname, "posts.json");

function getPosts() {
    try {
        const data = fs.readFileSync(postsFilePath);
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading posts.json:", error);
        return [];
    }
}

// ✅ Route to get all blog posts
app.get("/api/posts", (req, res) => {
    const posts = getPosts();
    res.json(posts);
});

// ✅ Route to get a single blog post by title
app.get("/api/posts/:title", (req, res) => {
    const postTitle = req.params.title.toLowerCase();
    const posts = getPosts();
    const post = posts.find(p => p.title.toLowerCase() === postTitle);

    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ error: "Post not found" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/llms.txt', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.sendFile(path.join(__dirname, 'public', 'llms.txt'));
});
