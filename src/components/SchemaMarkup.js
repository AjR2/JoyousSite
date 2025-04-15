// Improved version of SchemaMarkup.js with fixes for identified issues

import React from 'react';
import { Helmet } from 'react-helmet';

const SchemaMarkup = ({ type, data = {} }) => {
    let schema = {};

    switch (type) {
        case 'organization':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Akeyreu',
                url: 'https://www.akeyreu.com',
                logo: 'https://www.akeyreu.com/logo.png',
                sameAs: [
                    'https://instagram.com/a_keyreu/',
                    'https://tiktok.com/@akeyreu/'
                ],
                description: 'Akeyreu integrates advanced neural technologies with mental wellness practices, making technology-enhanced wellness accessible to everyone through nAura and Vza.'
            };
            break;

        case 'website':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Akeyreu',
                url: 'https://www.akeyreu.com',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://www.akeyreu.com/search?q={search_term_string}',
                    'query-input': 'required name=search_term_string'
                }
            };
            break;

        case 'article':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: data.name || 'Akeyreu Blog Post',
                description: data.description || '',
                image: data.image || 'https://www.akeyreu.com/blog-image.jpg',
                datePublished: data.datePublished ? new Date(data.datePublished).toISOString() : new Date().toISOString(),
                url: data.url || 'https://www.akeyreu.com/blog',
                author: {
                    '@type': 'Organization',
                    name: 'Akeyreu'
                },
                publisher: {
                    '@type': 'Organization',
                    name: 'Akeyreu',
                    logo: {
                        '@type': 'ImageObject',
                        url: 'https://www.akeyreu.com/logo.png'
                    }
                },
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': data.url || 'https://www.akeyreu.com/blog'
                }
            };
            break;

        case 'product':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: data.name || '',
                description: data.description || '',
                image: data.image || '',
                brand: {
                    '@type': 'Brand',
                    name: 'Akeyreu'
                }
            };
            break;

        default:
            return null;
    }

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
};

export default SchemaMarkup;
