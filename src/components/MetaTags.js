// Improved version of MetaTags.js with fixes for identified issues

import React from 'react';
import { Helmet } from 'react-helmet';

const MetaTags = ({
    title,
    description,
    keywords,
    canonicalUrl,
    ogType = 'website',
    publishDate = null,
    ogImage = 'https://www.akeyreu.com/logo.png' // Default OG image
}) => {
    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph Tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Article Specific Tags */}
            {ogType === 'article' && publishDate && (
                <>
                    <meta property="article:published_time" content={new Date(publishDate).toISOString()} />
                    <meta property="og:article:published_time" content={new Date(publishDate).toISOString()} />
                </>
            )}

            {/* Mobile Viewport */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Helmet>
    );
};

export default MetaTags;
