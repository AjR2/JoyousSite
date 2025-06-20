// Enhanced MetaTags component with comprehensive SEO and social media support

import React from 'react';
import { Helmet } from 'react-helmet-async';

const MetaTags = ({
    title,
    description,
    keywords,
    canonicalUrl,
    ogType = 'website',
    publishDate = null,
    modifiedDate = null,
    ogImage = 'https://www.akeyreu.com/assets/og-image.jpg',
    ogImageAlt = 'Akeyreu - Mental Wellness Through Neural Technology',
    author = 'Akeyreu',
    section = null,
    tags = [],
    locale = 'en_US',
    siteName = 'Akeyreu',
    twitterSite = '@akeyreu',
    twitterCreator = '@akeyreu',
    robots = 'index, follow',
    googleSiteVerification = null,
    bingVerification = null
}) => {
    // Debug all incoming props
    console.log('🐛 MetaTags Debug - Component called with title:', title);
    console.log('🐛 MetaTags Debug - All props:', {
        title, description, keywords, canonicalUrl, ogType, publishDate, modifiedDate,
        ogImage, ogImageAlt, author, section, tags, locale, siteName, twitterSite,
        twitterCreator, robots, googleSiteVerification, bingVerification
    });

    console.log('🐛 MetaTags Debug - Prop types:', {
        title: typeof title,
        description: typeof description,
        keywords: typeof keywords,
        canonicalUrl: typeof canonicalUrl,
        author: typeof author,
        tags: Array.isArray(tags) ? 'array' : typeof tags
    });

    // Helper function to safely convert values to strings
    const safeString = (value) => {
        console.log('🔍 MetaTags safeString called with:', { value, type: typeof value, isSymbol: typeof value === 'symbol' });
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'symbol') {
            console.warn('⚠️ MetaTags Symbol value detected and converted to empty string:', value);
            return '';
        }
        return String(value);
    };

    // Safely convert all props to strings
    const safeTitle = safeString(title);
    const safeDescription = safeString(description);
    const safeCanonicalUrl = safeString(canonicalUrl);
    const safeKeywords = safeString(keywords);
    const safeAuthor = safeString(author);
    const safeSection = safeString(section);
    const safeLocale = safeString(locale);
    const safeSiteName = safeString(siteName);
    const safeTwitterSite = safeString(twitterSite);
    const safeTwitterCreator = safeString(twitterCreator);
    const safeRobots = safeString(robots);
    const safeOgImage = safeString(ogImage);
    const safeOgImageAlt = safeString(ogImageAlt);

    console.log('🐛 MetaTags Debug - Safe converted values:', {
        safeTitle,
        safeDescription: safeDescription.substring(0, 50) + '...',
        safeCanonicalUrl,
        safeKeywords,
        safeAuthor
    });

    // Ensure title is not too long for social media
    const socialTitle = safeTitle.length > 60 ? safeTitle.substring(0, 57) + '...' : safeTitle;

    // Ensure description is optimal length
    const socialDescription = safeDescription.length > 160 ? safeDescription.substring(0, 157) + '...' : safeDescription;

    // Generate structured data for breadcrumbs if we have section info
    const breadcrumbStructuredData = safeSection ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.akeyreu.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": safeSection,
                "item": safeCanonicalUrl
            }
        ]
    } : null;

    console.log('🐛 MetaTags Debug - About to render Helmet with socialTitle:', socialTitle, 'type:', typeof socialTitle);
    console.log('🐛 MetaTags Debug - About to render Helmet with socialDescription:', socialDescription, 'type:', typeof socialDescription);

    // Check all the values we're about to pass to Helmet
    const helmetProps = {
        socialTitle,
        socialDescription,
        safeKeywords,
        safeAuthor,
        safeRobots,
        safeLocale,
        safeCanonicalUrl,
        safeOgImage,
        safeOgImageAlt,
        safeSiteName,
        safeTwitterSite,
        safeTwitterCreator,
        ogType,
        publishDate,
        modifiedDate,
        tags
    };

    console.log('🐛 MetaTags Debug - All Helmet props:', helmetProps);

    // Check for any Symbol values in the props
    Object.entries(helmetProps).forEach(([key, value]) => {
        if (typeof value === 'symbol') {
            console.error('🚨 SYMBOL DETECTED in', key, ':', value);
        }
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                if (typeof item === 'symbol') {
                    console.error('🚨 SYMBOL DETECTED in', key, 'at index', index, ':', item);
                }
            });
        }
    });

    try {
        return (
            <Helmet>
            {/* Basic Meta Tags */}
            <title>{socialTitle}</title>
            <meta name="description" content={socialDescription} />
            {safeKeywords && <meta name="keywords" content={safeKeywords} />}
            <meta name="author" content={safeAuthor} />
            <meta name="robots" content={safeRobots} />

            {/* Language and Locale */}
            <html lang="en" />
            <meta property="og:locale" content={safeLocale} />

            {/* Canonical URL */}
            <link rel="canonical" href={safeCanonicalUrl} />

            {/* Favicon and Icons */}
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="manifest" href="/site.webmanifest" />

            {/* Theme Color for Mobile */}
            <meta name="theme-color" content="#0066CC" />
            <meta name="msapplication-TileColor" content="#0066CC" />

            {/* Search Engine Verification */}
            {googleSiteVerification && (
                <meta name="google-site-verification" content={googleSiteVerification} />
            )}
            {bingVerification && (
                <meta name="msvalidate.01" content={bingVerification} />
            )}

            {/* Open Graph Tags */}
            <meta property="og:title" content={socialTitle} />
            <meta property="og:description" content={socialDescription} />
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={safeCanonicalUrl} />
            <meta property="og:image" content={safeOgImage} />
            <meta property="og:image:alt" content={safeOgImageAlt} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content={safeSiteName} />

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={safeTwitterSite} />
            <meta name="twitter:creator" content={safeTwitterCreator} />
            <meta name="twitter:title" content={socialTitle} />
            <meta name="twitter:description" content={socialDescription} />
            <meta name="twitter:image" content={safeOgImage} />
            <meta name="twitter:image:alt" content={safeOgImageAlt} />

            {/* Article Specific Tags */}
            {ogType === 'article' && (
                <>
                    {publishDate && (
                        <>
                            <meta property="article:published_time" content={new Date(publishDate).toISOString()} />
                            <meta property="og:article:published_time" content={new Date(publishDate).toISOString()} />
                        </>
                    )}
                    {modifiedDate && (
                        <meta property="article:modified_time" content={new Date(modifiedDate).toISOString()} />
                    )}
                    {safeAuthor && (
                        <meta property="article:author" content={safeAuthor} />
                    )}
                    {safeSection && (
                        <meta property="article:section" content={safeSection} />
                    )}
                    {Array.isArray(tags) && tags.length > 0 && tags.map((tag, index) => (
                        <meta key={index} property="article:tag" content={safeString(tag)} />
                    ))}
                </>
            )}

            {/* Mobile Viewport */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

            {/* Performance and Security */}
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta name="format-detection" content="telephone=no" />

            {/* Structured Data for Breadcrumbs */}
            {breadcrumbStructuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbStructuredData)}
                </script>
            )}
        </Helmet>
        );
    } catch (error) {
        console.error('🚨 Error in MetaTags Helmet rendering:', error);
        console.error('🚨 Error stack:', error.stack);
        console.error('🚨 Props that caused error:', helmetProps);

        // Return a minimal Helmet as fallback
        return (
            <Helmet>
                <title>Akeyreu</title>
                <meta name="description" content="Mental wellness through neural technology" />
            </Helmet>
        );
    }
};

export default MetaTags;
