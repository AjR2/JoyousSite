import React from 'react';
import { Helmet } from 'react-helmet';

const SchemaMarkup = ({ type, data }) => {
    let schemaMarkup = '';

    switch (type) {
        case 'organization':
            schemaMarkup = {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Akeyreu",
                "url": "https://www.akeyreu.com",
                "logo": "https://www.akeyreu.com/logo.png",
                "description": "Mental wellness technology company integrating advanced neural technologies with wellness practices.",
            };
            break;

        case 'product':
            schemaMarkup = {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": data.name,
                "description": data.description,
                "brand": {
                    "@type": "Brand",
                    "name": "Akeyreu"
                },
            };
            break;

        case 'article':
            schemaMarkup = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": data.title,
                "author": {
                    "@type": "Organization",
                    "name": "Akeyreu"
                },
            };
            break;
    }

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schemaMarkup)}
            </script>
        </Helmet>
    );
};

export default SchemaMarkup;
