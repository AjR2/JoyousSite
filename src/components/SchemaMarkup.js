// Enhanced SchemaMarkup component with comprehensive structured data support
// Domain: enactive.ai (Enactive brand)

import { Helmet } from 'react-helmet-async';

// Centralized domain configuration for SEO consistency
const SITE_CONFIG = {
    domain: 'https://www.enactive.ai',
    name: 'Enactive',
    alternateName: 'Enactive Cognitive Systems',
    email: 'info@enactive.ai',
    logo: '/assets/logo.png',
    ogImage: '/assets/og-image.jpg',
    foundingDate: '2023',
    social: {
        instagram: 'https://instagram.com/a_keyreu/',
        tiktok: 'https://tiktok.com/@akeyreu/',
        linkedin: 'https://www.linkedin.com/company/enactive'
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
                description: 'Enactive builds structural interventions for cognitive flexibility and execution integrity. We help operators in high-stakes environments detect and correct degradation patterns.',
                foundingDate: SITE_CONFIG.foundingDate,
                industry: 'Cognitive Systems Technology',
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
                name: `${SITE_CONFIG.name} - Cognitive Systems for Execution Integrity`,
                alternateName: SITE_CONFIG.name,
                url: baseUrl,
                description: 'Enactive builds structural interventions for operators who cannot afford execution failure. Pre-collapse prevention and founder performance stabilization.',
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
                headline: data.name || 'Enactive Blog Post',
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
                    name: 'Enactive Blog',
                    description: 'Cognitive systems insights and execution integrity content'
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
                        name: 'Cognitive Systems'
                    },
                    {
                        '@type': 'Thing',
                        name: 'Execution Integrity'
                    }
                ],
                keywords: data.keywords || ['cognitive systems', 'execution integrity', 'founder performance', 'decision drift', 'containment'],
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
                category: 'Cognitive Systems Technology',
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
                name: 'Enactive Blog',
                description: 'Cognitive systems insights, execution integrity, and founder performance content',
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
                    { '@type': 'Thing', name: 'Cognitive Systems' },
                    { '@type': 'Thing', name: 'Execution Integrity' },
                    { '@type': 'Thing', name: 'Founder Performance' }
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
                description: 'Cognitive systems platform for execution integrity and founder performance',
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
                name: 'Contact Enactive',
                description: 'Get in touch with the Enactive team',
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
