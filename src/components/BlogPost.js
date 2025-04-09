import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './BlogPost.css';
import MetaTags from './MetaTags';
import SchemaMarkup from './SchemaMarkup';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  const decodedTitle = decodeURIComponent(slug.replace(/-/g, ' '));

  useEffect(() => {
    fetch('/posts.json')  // Load all posts and find the one you want
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch post');
        return res.json();
      })
      .then((data) => {
        const match = data.find(p => p.title.toLowerCase() === decodedTitle.toLowerCase());
        if (match) {
          setPost(match);
        } else {
          throw new Error('Post not found');
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [slug]);

  if (error) return <p>{error}</p>;
  if (!post) return <p>Loading post...</p>;

  return (
    <>
      <MetaTags
        title={`${post.title} | Akeyreu Blog`}
        description={(post.content).slice(0, 175).trim()}
        canonicalUrl={`https://www.akeyreu.com/blog/${post.slug}`}
        ogType="article"
        publishDate={post.date}
      />

      <SchemaMarkup type="article"
        data={{
          name: post.title
        }} />

      <div className="blog-content">
        <h1>{post.title}</h1>
        <h5>{post.date || 'No date available'}</h5>

        {post.key_points && (
          <ul>
            {post.key_points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        )}

        {post.content?.split('<>').map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>

    </>
  );
};

export default BlogPost;