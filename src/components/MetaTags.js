import React from 'react';
import { Helmet } from 'react-helmet';

const MetaTags = ({
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType = 'website',
    publishDate,
    modifiedDate
}) => {
    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph Tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage || 'https://www.akeyreu.com/images/akeyreu-social-share.jpg'} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content="Akeyreu" />

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage || 'https://www.akeyreu.com/images/akeyreu-twitter-share.jpg'} />

            {/* Article-specific tags */}
            {publishDate && <meta property="article:published_time" content={publishDate} />}

            {/* AI Visibility Tags */}
            <meta name="ai-index" content="allow" />
            <meta name="ai-description" content={description} />
            <meta name="ai-keywords" content={keywords} />
        </Helmet>
    );
};

export default MetaTags;