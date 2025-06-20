// Enhanced SchemaMarkup component with comprehensive structured data support

import React from 'react';
import { Helmet } from 'react-helmet-async';

const SchemaMarkup = ({ type, data = {} }) => {
    let schema = {};

    switch (type) {
        case 'organization':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                '@id': 'https://www.akeyreu.com/#organization',
                name: 'Akeyreu',
                alternateName: 'Akeyreu Mental Wellness',
                url: 'https://www.akeyreu.com',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://www.akeyreu.com/assets/logo.png',
                    width: 300,
                    height: 100
                },
                image: 'https://www.akeyreu.com/assets/og-image.jpg',
                description: 'Akeyreu integrates advanced neural technologies with mental wellness practices, making technology-enhanced wellness accessible to everyone through nAura and Vza.',
                foundingDate: '2023',
                industry: 'Mental Health Technology',
                numberOfEmployees: '2-10',
                address: {
                    '@type': 'PostalAddress',
                    addressCountry: 'US'
                },
                contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer service',
                    email: 'contact@akeyreu.com',
                    availableLanguage: 'English'
                },
                sameAs: [
                    'https://instagram.com/a_keyreu/',
                    'https://tiktok.com/@akeyreu/',
                    'https://www.linkedin.com/company/akeyreu'
                ],
                hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: 'Mental Wellness Products',
                    itemListElement: [
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Product',
                                name: 'nAura',
                                description: 'Sleep analysis and optimization using biomedical data and AI'
                            }
                        },
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Product',
                                name: 'Vza',
                                description: 'Proactive CBT approach for mental wellness with real-time biometric data'
                            }
                        }
                    ]
                }
            };
            break;

        case 'website':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                '@id': 'https://www.akeyreu.com/#website',
                name: 'Akeyreu - Mental Wellness Through Neural Technology',
                alternateName: 'Akeyreu',
                url: 'https://www.akeyreu.com',
                description: 'Pioneering the integration of advanced neural technologies and mental wellness practices for personalized cognitive enhancement.',
                inLanguage: 'en-US',
                isPartOf: {
                    '@type': 'Organization',
                    '@id': 'https://www.akeyreu.com/#organization'
                },
                about: {
                    '@type': 'Thing',
                    name: 'Mental Wellness Technology'
                },
                audience: {
                    '@type': 'Audience',
                    audienceType: 'Individuals seeking mental wellness solutions'
                },
                potentialAction: [
                    {
                        '@type': 'SearchAction',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate: 'https://www.akeyreu.com/blog?search={search_term_string}'
                        },
                        'query-input': 'required name=search_term_string'
                    },
                    {
                        '@type': 'ReadAction',
                        target: 'https://www.akeyreu.com/blog'
                    }
                ]
            };
            break;

        case 'article':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                '@id': data.url || 'https://www.akeyreu.com/blog',
                headline: data.name || 'Akeyreu Blog Post',
                alternativeHeadline: data.alternativeHeadline,
                description: data.description || '',
                abstract: data.summary || data.description || '',
                articleBody: data.content || '',
                image: {
                    '@type': 'ImageObject',
                    url: data.image || 'https://www.akeyreu.com/assets/blog-default.jpg',
                    width: 1200,
                    height: 630
                },
                datePublished: data.datePublished ? new Date(data.datePublished).toISOString() : new Date().toISOString(),
                dateModified: data.dateModified ? new Date(data.dateModified).toISOString() : (data.datePublished ? new Date(data.datePublished).toISOString() : new Date().toISOString()),
                url: data.url || 'https://www.akeyreu.com/blog',
                inLanguage: 'en-US',
                isPartOf: {
                    '@type': 'Blog',
                    '@id': 'https://www.akeyreu.com/blog#blog',
                    name: 'Akeyreu Blog',
                    description: 'Mental wellness insights and neural technology updates'
                },
                author: {
                    '@type': 'Organization',
                    '@id': 'https://www.akeyreu.com/#organization',
                    name: 'Akeyreu',
                    url: 'https://www.akeyreu.com'
                },
                publisher: {
                    '@type': 'Organization',
                    '@id': 'https://www.akeyreu.com/#organization',
                    name: 'Akeyreu',
                    logo: {
                        '@type': 'ImageObject',
                        url: 'https://www.akeyreu.com/assets/logo.png',
                        width: 300,
                        height: 100
                    }
                },
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': data.url || 'https://www.akeyreu.com/blog'
                },
                about: [
                    {
                        '@type': 'Thing',
                        name: 'Mental Wellness'
                    },
                    {
                        '@type': 'Thing',
                        name: 'Neural Technology'
                    }
                ],
                keywords: data.keywords || ['mental wellness', 'neural technology', 'cognitive health'],
                wordCount: data.wordCount || (data.content ? data.content.split(' ').length : 0)
            };

            // Add article section if provided
            if (data.section) {
                schema.articleSection = data.section;
            }

            // Add tags if provided
            if (data.tags && data.tags.length > 0) {
                schema.keywords = data.tags.join(', ');
            }
            break;

        case 'product':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'Product',
                '@id': data.url || `https://www.akeyreu.com/products/${data.name?.toLowerCase()}`,
                name: data.name || '',
                description: data.description || '',
                category: 'Mental Wellness Technology',
                image: {
                    '@type': 'ImageObject',
                    url: data.image || 'https://www.akeyreu.com/assets/product-default.jpg',
                    width: 800,
                    height: 600
                },
                brand: {
                    '@type': 'Brand',
                    name: 'Akeyreu',
                    logo: 'https://www.akeyreu.com/assets/logo.png'
                },
                manufacturer: {
                    '@type': 'Organization',
                    '@id': 'https://www.akeyreu.com/#organization',
                    name: 'Akeyreu'
                },
                audience: {
                    '@type': 'Audience',
                    audienceType: 'Individuals seeking mental wellness solutions'
                }
            };

            // Add offers if provided
            if (data.offers) {
                schema.offers = {
                    '@type': 'Offer',
                    availability: 'https://schema.org/InStock',
                    priceCurrency: 'USD',
                    seller: {
                        '@type': 'Organization',
                        '@id': 'https://www.akeyreu.com/#organization'
                    }
                };
            }
            break;

        case 'blog':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'Blog',
                '@id': 'https://www.akeyreu.com/blog#blog',
                name: 'Akeyreu Blog',
                description: 'Mental wellness insights, neural technology updates, and cognitive health tips',
                url: 'https://www.akeyreu.com/blog',
                inLanguage: 'en-US',
                author: {
                    '@type': 'Organization',
                    '@id': 'https://www.akeyreu.com/#organization'
                },
                publisher: {
                    '@type': 'Organization',
                    '@id': 'https://www.akeyreu.com/#organization'
                },
                about: [
                    {
                        '@type': 'Thing',
                        name: 'Mental Wellness'
                    },
                    {
                        '@type': 'Thing',
                        name: 'Neural Technology'
                    },
                    {
                        '@type': 'Thing',
                        name: 'Cognitive Health'
                    }
                ]
            };
            break;

        case 'breadcrumb':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: data.items || []
            };
            break;

        case 'faq':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: data.questions?.map((q) => ({
                    '@type': 'Question',
                    name: q.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: q.answer
                    }
                })) || []
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
