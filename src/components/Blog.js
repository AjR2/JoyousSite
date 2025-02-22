import React, { useState } from 'react';
import posts from './posts.json'; // Import the local JSON file
import './Blog.css'; // Import the new CSS file

const BlogHome = () => {
  const [selectedPost, setSelectedPost] = useState(null); // Start with no selected post

  const handlePostClick = (postTitle) => {
    // Find the selected post by title
    const post = posts.find((post) => post.title === postTitle);
    if (post) {
      setSelectedPost(post); // Update the selectedPost state
    } else {
      console.error('Post not found for title:', postTitle); // Debugging: Log if no post is found
    }
  };

  return (
    <div className="blog-container">
      {/* Blog Post List */}
      <div className="blog-sidebar">
        <h2>Blog Posts</h2>
        <ul className="blog-post-list">
          {posts.map((post) => (
            <li
              key={post.title} // Use title as the key
              className="blog-post-item"
              onClick={() => handlePostClick(post.title)} // Use title to identify the post
            >
              {post.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Selected Blog Post Content */}
      <div className="blog-content">
        {selectedPost ? (
          <div>
            <h1>{selectedPost.title}</h1>
            <h5>{selectedPost.date}</h5>
            {/* Split content into paragraphs */}
            {selectedPost.content.split('<>').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <p>Select a blog post to view its content.</p>
        )}
      </div>
    </div>
  );
};

export default BlogHome;

// for server.js database
// import React, { useState, useEffect } from 'react';
// import './Blog.css';

// const BlogHome = () => {
//   const [posts, setPosts] = useState([]);
//   const [selectedPost, setSelectedPost] = useState(null);

//   // Fetch all posts on component mount
//   useEffect(() => {
//     fetch('http://localhost:5000/posts')
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error('Failed to fetch posts');
//         }
//         return response.json();
//       })
//       .then((data) => setPosts(data))
//       .catch((error) => console.error('Error fetching posts:', error));
//   }, []);

//   const handlePostClick = (postId) => {
//     // Fetch a single post by ID
//     fetch(`http://localhost:5000/posts/${postId}`)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error('Failed to fetch the selected post');
//         }
//         return response.json();
//       })
//       .then((data) => setSelectedPost(data))
//       .catch((error) => console.error('Error fetching post:', error));
//   };

//   return (
//     <div className="blog-container">
//       {/* Blog Post List */}
//       <div className="blog-sidebar">
//         <h2>Blog Posts</h2>
//         <ul className="blog-post-list">
//           {posts.map((post) => (
//             <li
//               key={post.id}
//               className="blog-post-item"
//               onClick={() => handlePostClick(post.id)}
//             >
//               {post.title}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Selected Blog Post Content */}
//       <div className="blog-content">
//         {selectedPost ? (
//           <div>
//             <h1>{selectedPost.title}</h1>
//             <h5>{selectedPost.date}</h5>
//             {selectedPost.content.split('<>').map((paragraph, index) => (
//               <p key={index}>{paragraph}</p>
//             ))}
//           </div>
//         ) : (
//           <p>Select a blog post to view its content.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BlogHome;
