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
    fetch(`http://localhost:3001/api/posts/${encodeURIComponent(decodedTitle)}`) // need to update to real
      .then((res) => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then((data) => {
        setPost(data);
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