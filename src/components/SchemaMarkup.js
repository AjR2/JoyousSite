// Enhanced SchemaMarkup component with comprehensive structured data support
// Domain: yourjoyousmind.com (Joyous brand)

import { Helmet } from 'react-helmet-async';

// Centralized domain configuration for SEO consistency
const SITE_CONFIG = {
    domain: 'https://www.yourjoyousmind.com',
    name: 'Joyous',
    alternateName: 'Your Joyous Mind',
    email: 'info@yourjoyousmind.com',
    logo: '/assets/logo.png',
    ogImage: '/assets/og-image.jpg',
    foundingDate: '2023',
    social: {
        instagram: 'https://instagram.com/yourjoyousmind/',
        tiktok: 'https://tiktok.com/@yourjoyousmind/',
        linkedin: 'https://www.linkedin.com/company/joyous'
    }
};

const SchemaMarkup = ({ type, data = {} }) => {
    let schema = {};
    const baseUrl = SITE_CONFIG.domain;

    switch (type) {
        case 'organization':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                '@id': `${baseUrl}/#organization`,
                name: SITE_CONFIG.name,
                alternateName: SITE_CONFIG.alternateName,
                url: baseUrl,
                logo: {
                    '@type': 'ImageObject',
                    url: `${baseUrl}${SITE_CONFIG.logo}`,
                    width: 300,
                    height: 100
                },
                image: `${baseUrl}${SITE_CONFIG.ogImage}`,
                description: 'Joyous is a human-centered technology platform focused on supporting personal agency, wellbeing, and insight through innovative mental wellness solutions.',
                foundingDate: SITE_CONFIG.foundingDate,
                industry: 'Mental Health Technology',
                numberOfEmployees: '2-10',
                address: {
                    '@type': 'PostalAddress',
                    addressCountry: 'US'
                },
                contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer service',
                    email: SITE_CONFIG.email,
                    availableLanguage: 'English'
                },
                sameAs: Object.values(SITE_CONFIG.social)
            };
            break;

        case 'website':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                '@id': `${baseUrl}/#website`,
                name: `${SITE_CONFIG.name} - Mental Wellness & Personal Growth`,
                alternateName: SITE_CONFIG.name,
                url: baseUrl,
                description: 'Joyous empowers personal agency, wellbeing, and insight through human-centered technology and mental wellness practices.',
                inLanguage: 'en-US',
                publisher: {
                    '@type': 'Organization',
                    '@id': `${baseUrl}/#organization`
                },
                potentialAction: [
                    {
                        '@type': 'SearchAction',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate: `${baseUrl}/blog?search={search_term_string}`
                        },
                        'query-input': 'required name=search_term_string'
                    },
                    {
                        '@type': 'ReadAction',
                        target: `${baseUrl}/blog`
                    }
                ]
            };
            break;

        case 'article':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                '@id': data.url || `${baseUrl}/blog`,
                headline: data.name || 'Joyous Blog Post',
                alternativeHeadline: data.alternativeHeadline,
                description: data.description || '',
                abstract: data.summary || data.description || '',
                articleBody: data.content || '',
                image: {
                    '@type': 'ImageObject',
                    url: data.image || `${baseUrl}${SITE_CONFIG.ogImage}`,
                    width: 1200,
                    height: 630
                },
                datePublished: data.datePublished ? new Date(data.datePublished).toISOString() : new Date().toISOString(),
                dateModified: data.dateModified ? new Date(data.dateModified).toISOString() : (data.datePublished ? new Date(data.datePublished).toISOString() : new Date().toISOString()),
                url: data.url || `${baseUrl}/blog`,
                inLanguage: 'en-US',
                isPartOf: {
                    '@type': 'Blog',
                    '@id': `${baseUrl}/blog#blog`,
                    name: 'Joyous Blog',
                    description: 'Mental wellness insights and personal growth content'
                },
                author: {
                    '@type': 'Organization',
                    '@id': `${baseUrl}/#organization`,
                    name: SITE_CONFIG.name,
                    url: baseUrl
                },
                publisher: {
                    '@type': 'Organization',
                    '@id': `${baseUrl}/#organization`,
                    name: SITE_CONFIG.name,
                    logo: {
                        '@type': 'ImageObject',
                        url: `${baseUrl}${SITE_CONFIG.logo}`,
                        width: 300,
                        height: 100
                    }
                },
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': data.url || `${baseUrl}/blog`
                },
                about: [
                    {
                        '@type': 'Thing',
                        name: 'Mental Wellness'
                    },
                    {
                        '@type': 'Thing',
                        name: 'Personal Growth'
                    }
                ],
                keywords: data.keywords || ['mental wellness', 'joy', 'happiness', 'emotional health', 'personal growth'],
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
                '@id': data.url || `${baseUrl}/products/${data.name?.toLowerCase()}`,
                name: data.name || '',
                description: data.description || '',
                category: 'Mental Wellness Technology',
                image: {
                    '@type': 'ImageObject',
                    url: data.image || `${baseUrl}${SITE_CONFIG.ogImage}`,
                    width: 800,
                    height: 600
                },
                brand: {
                    '@type': 'Brand',
                    name: SITE_CONFIG.name,
                    logo: `${baseUrl}${SITE_CONFIG.logo}`
                },
                manufacturer: {
                    '@type': 'Organization',
                    '@id': `${baseUrl}/#organization`,
                    name: SITE_CONFIG.name
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
                        '@id': `${baseUrl}/#organization`
                    }
                };
            }
            break;

        case 'blog':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'Blog',
                '@id': `${baseUrl}/blog#blog`,
                name: 'Joyous Blog',
                description: 'Mental wellness insights, personal growth tips, and mindfulness practices',
                url: `${baseUrl}/blog`,
                inLanguage: 'en-US',
                author: {
                    '@type': 'Organization',
                    '@id': `${baseUrl}/#organization`
                },
                publisher: {
                    '@type': 'Organization',
                    '@id': `${baseUrl}/#organization`
                },
                about: [
                    { '@type': 'Thing', name: 'Mental Wellness' },
                    { '@type': 'Thing', name: 'Mindfulness' },
                    { '@type': 'Thing', name: 'Personal Growth' }
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

        case 'localBusiness':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'ProfessionalService',
                '@id': `${baseUrl}/#business`,
                name: SITE_CONFIG.name,
                url: baseUrl,
                image: `${baseUrl}${SITE_CONFIG.ogImage}`,
                description: 'Human-centered technology platform for mental wellness and personal growth',
                email: SITE_CONFIG.email,
                priceRange: '$$',
                address: {
                    '@type': 'PostalAddress',
                    addressCountry: 'US'
                }
            };
            break;

        case 'contactPage':
            schema = {
                '@context': 'https://schema.org',
                '@type': 'ContactPage',
                '@id': `${baseUrl}/contact`,
                name: 'Contact Joyous',
                description: 'Get in touch with the Joyous team',
                url: `${baseUrl}/contact`,
                mainEntity: {
                    '@type': 'Organization',
                    '@id': `${baseUrl}/#organization`
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

// Export site config for use in other components
export { SITE_CONFIG };
export default SchemaMarkup;
