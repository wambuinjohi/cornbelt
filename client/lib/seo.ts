export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonicalUrl?: string;
  author?: string;
  twitterCard?: string;
  twitterSite?: string;
  structuredData?: Record<string, any>;
}

export const useUpdateMetaTags = (metadata: SEOMetadata) => {
  // Update or create title
  let titleTag = document.querySelector("title");
  if (!titleTag) {
    titleTag = document.createElement("title");
    document.head.appendChild(titleTag);
  }
  titleTag.textContent = metadata.title;

  // Update or create meta description
  updateMetaTag("description", metadata.description);

  // Update or create keywords
  if (metadata.keywords) {
    updateMetaTag("keywords", metadata.keywords);
  }

  // Open Graph tags
  updateMetaTag("og:title", metadata.ogTitle || metadata.title, "property");
  updateMetaTag(
    "og:description",
    metadata.ogDescription || metadata.description,
    "property",
  );
  if (metadata.ogImage) {
    updateMetaTag("og:image", metadata.ogImage, "property");
  }
  if (metadata.ogUrl) {
    updateMetaTag("og:url", metadata.ogUrl, "property");
  }
  updateMetaTag("og:type", "website", "property");

  // Twitter Card tags
  updateMetaTag("twitter:card", metadata.twitterCard || "summary_large_image");
  if (metadata.twitterSite) {
    updateMetaTag("twitter:site", metadata.twitterSite);
  }

  // Canonical URL
  if (metadata.canonicalUrl) {
    let canonical = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = metadata.canonicalUrl;
  }

  // Structured data (JSON-LD)
  if (metadata.structuredData) {
    updateStructuredData(metadata.structuredData);
  }
};

function updateMetaTag(
  name: string,
  content: string,
  type: "name" | "property" = "name",
) {
  let tag = document.querySelector(
    `meta[${type}="${name}"]`,
  ) as HTMLMetaElement;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(type, name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function updateStructuredData(data: Record<string, any>) {
  let script = document.querySelector(
    'script[type="application/ld+json"]',
  ) as HTMLScriptElement;
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export const siteMeta = {
  title: "Cornbelt Flour Mill - Premium Fortified Maize Meal in Kenya",
  description:
    "Kenya's finest fortified maize flour. Nourishing families since 2003 with quality, tradition, and excellence. Farm-to-table grain products.",
  keywords:
    "maize flour, fortified flour, Kenya flour, grain mill, whole grain, maize meal, nutritious food, family nutrition",
  ogImage:
    "https://cdn.builder.io/api/v1/image/assets%2Fbf7a511dd4454ae88c7c49627a9a0f54%2F80b3bed3a8e14bf3ae5cc941d2cfab50?format=webp&width=1200",
  twitterSite: "@cornbeltmill",
};

export const pageMetadata = {
  home: {
    title: "Cornbelt Flour Mill - Premium Fortified Maize Meal in Kenya",
    description:
      "Kenya's finest fortified maize flour – nourishing families with quality, tradition, and excellence since 2003. Shop our premium grain products.",
    keywords:
      "maize flour, fortified flour, Kenya, grain mill, maize meal, family nutrition, quality flour",
  },
  products: {
    title: "Our Products - Cornbelt Flour Mill",
    description:
      "Discover our premium fortified maize meal and grain products. High-quality, nutritious flour products sourced and milled with excellence.",
    keywords:
      "maize flour products, fortified flour Kenya, whole grain, maize meal brands, nutritious flour",
  },
  about: {
    title: "About Cornbelt Flour Mill - Our Story & Values",
    description:
      "Learn about Cornbelt Flour Mill's journey from 2003 to becoming Kenya's trusted grain processor. Our vision, mission, and commitment to quality.",
    keywords:
      "about Cornbelt, flour mill Kenya, company history, grain processing, quality commitment, our story",
  },
  contact: {
    title: "Contact Cornbelt Flour Mill - Get In Touch",
    description:
      "Reach out to Cornbelt Flour Mill for product inquiries, wholesale, or support. Multiple contact methods available.",
    keywords:
      "contact Cornbelt, flour mill contact, customer support, wholesale inquiries, Kenya contact",
  },
  privacy: {
    title: "Privacy Policy - Cornbelt Flour Mill",
    description:
      "Read Cornbelt Flour Mill's privacy policy to understand how we collect, use, and protect your personal information.",
    keywords: "privacy policy, data protection, personal information, privacy",
  },
  terms: {
    title: "Terms of Service - Cornbelt Flour Mill",
    description:
      "Review the terms and conditions for using Cornbelt Flour Mill's website and services.",
    keywords:
      "terms of service, terms and conditions, legal terms, website terms",
  },
  notfound: {
    title: "Page Not Found - Cornbelt Flour Mill",
    description: "The page you're looking for doesn't exist.",
    keywords: "404, page not found",
  },
};

export const getStructuredDataOrganization = (url: string) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Cornbelt Flour Mill Limited",
  description:
    "Premium fortified maize flour and grain mill products from Kenya",
  url: url,
  telephone: "+254-700-000-000",
  email: "info@cornbelt.co.ke",
  logo: "https://cdn.builder.io/api/v1/image/assets%2Fbf7a511dd4454ae88c7c49627a9a0f54%2F80b3bed3a8e14bf3ae5cc941d2cfab50?format=webp&width=200",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F4a2cc68749f24d2b8f3d41537c67e99d?format=webp&width=800",
  sameAs: [
    "https://www.facebook.com/cornbelt.co.ke",
    "https://www.twitter.com/cornbelt_ke",
    "https://www.instagram.com/cornbelt_ke",
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "National Cereals & Produce Board Land",
    addressLocality: "Kenya",
    addressCountry: "KE",
  },
  areaServed: "KE",
  foundingDate: "2003",
  founder: {
    "@type": "Person",
    name: "Mr. Ngure Muchune Paul",
  },
  priceRange: "KES",
});

export const getStructuredDataProduct = (
  name: string,
  description: string,
  url: string,
  image?: string,
) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: name,
  description: description,
  url: url,
  image: image,
  brand: {
    "@type": "Brand",
    name: "Cornbelt",
  },
  manufacturer: {
    "@type": "Organization",
    name: "Cornbelt Flour Mill Limited",
  },
  category: "Food & Groceries",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "150",
  },
});

export const getStructuredDataBreadcrumb = (
  items: Array<{ name: string; url: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const getStructuredDataFAQ = (
  faqs: Array<{ question: string; answer: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});
