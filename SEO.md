# SEO Implementation Guide

This document outlines the comprehensive SEO optimizations implemented for Cornbelt Flour Mill's website.

## Overview

The website now includes comprehensive SEO features to improve search engine visibility, user engagement, and overall online presence.

## Key SEO Components Implemented

### 1. Meta Tags (index.html)

- **Primary Meta Tags**: Title, description, keywords, author, language
- **Open Graph Tags**: For social media sharing (Facebook, LinkedIn, etc.)
- **Twitter Card Tags**: For Twitter-specific sharing optimization
- **Robots Meta Tag**: Allows indexing by search engines
- **Canonical URL**: Prevents duplicate content issues
- **Preconnect & DNS-Prefetch**: Improves loading performance for external resources
- **Theme Color**: Sets browser UI color for mobile devices

### 2. Structured Data (Schema.org / JSON-LD)

Implemented multiple structured data schemas:

#### Organization Schema
- Company information (name, URL, email, phone)
- Logo and images
- Social media links
- Address and service areas
- Founding date and founder information

#### LocalBusiness Schema
- Enhanced organization data with local business specifics
- Geo-targeting information
- Business hours (can be added to Contact page)
- Service radius

#### Product Schema
- Product information on Products page
- Brand and manufacturer details
- Category classification
- Aggregate ratings and review counts

#### Breadcrumb List Schema
- Navigation hierarchy for better crawling
- Available through `getStructuredDataBreadcrumb()` utility

#### FAQ Schema
- Question and answer pairs
- Available through `getStructuredDataFAQ()` utility

### 3. Sitemap (sitemap.xml)

- Auto-generated XML sitemap at `/sitemap.xml`
- Includes all main pages with priority levels
- Includes image references for image indexing
- Last modification dates for freshness signals
- Referenced in robots.txt and HTML head

### 4. Robots.txt

- Optimized robots.txt configuration
- Allows search engine crawling
- Blocks admin and API routes from indexing
- References sitemap location
- Custom user-agent rules for different search engines

### 5. Dynamic Meta Tags Per Page

Each main page now includes page-specific SEO metadata:

#### Home Page (Index.tsx)
- Optimized for brand and home keywords
- Includes organizational schema
- Target: Homepage rankings

#### Products Page (Products.tsx)
- Product-focused keywords
- Product schema markup
- Target: Product discovery

#### About Page (About.tsx)
- Company history and values keywords
- Organization schema
- Target: Brand and company information searches

#### Contact Page (Contact.tsx)
- Local and contact keywords
- Local business schema
- Target: Contact and location searches

#### 404 Page (NotFound.tsx)
- Proper canonical and metadata for error pages
- Helps search engines understand the issue

### 6. Performance Headers (netlify.toml)

Security and performance headers:
- X-Frame-Options: SAMEORIGIN (clickjacking protection)
- X-Content-Type-Options: nosniff (MIME sniffing prevention)
- X-XSS-Protection: 1; mode=block (XSS attack prevention)
- Referrer-Policy: strict-origin-when-cross-origin (privacy)
- Permissions-Policy: Restricts feature access

Caching strategies:
- HTML files: 1 hour cache
- Assets (JS/CSS): 1 year immutable cache
- Images: 1 year immutable cache

## SEO Utilities

### useUpdateMetaTags Hook

Location: `client/lib/seo.ts`

Used for dynamically updating meta tags and structured data:

```typescript
import { useUpdateMetaTags, pageMetadata, getStructuredDataOrganization } from "@/lib/seo";

useEffect(() => {
  useUpdateMetaTags({
    title: "Page Title",
    description: "Page description",
    keywords: "keyword1, keyword2",
    ogTitle: "Social media title",
    ogDescription: "Social media description",
    ogImage: "image-url",
    ogUrl: "page-url",
    canonicalUrl: "canonical-url",
    structuredData: getStructuredDataOrganization("url"),
  });
}, []);
```

### Available Utilities

- `useUpdateMetaTags(metadata)`: Updates all meta tags and structured data
- `pageMetadata`: Pre-configured metadata for each page
- `siteMeta`: Global site metadata
- `getStructuredDataOrganization(url)`: Organization schema
- `getStructuredDataProduct(name, description, url, image)`: Product schema
- `getStructuredDataBreadcrumb(items)`: Breadcrumb schema
- `getStructuredDataFAQ(faqs)`: FAQ schema

### SEOHead Component

Location: `client/components/SEOHead.tsx`

Reusable component for page SEO management:

```typescript
import SEOHead from "@/components/SEOHead";

export default function Page() {
  return (
    <>
      <SEOHead
        title="Page Title"
        description="Page description"
        keywords="keyword1, keyword2"
        // ... other properties
      />
      {/* Page content */}
    </>
  );
}
```

## Best Practices for Maintaining SEO

### When Adding New Pages

1. Add page metadata to `pageMetadata` in `client/lib/seo.ts`
2. Use `useUpdateMetaTags()` in the page component's `useEffect`
3. Add proper heading hierarchy (h1, h2, h3)
4. Include descriptive alt text for images
5. Update sitemap.xml endpoint in `server/index.ts`

### Content Guidelines

- **Title Tags**: 50-60 characters, include target keyword
- **Meta Descriptions**: 150-160 characters, compelling and action-oriented
- **Keywords**: 5-10 relevant, natural keywords per page
- **Headings**: One H1 per page, proper hierarchy for structure
- **Images**: Always include descriptive alt text
- **Internal Links**: Use descriptive anchor text

### Image Optimization

- Use modern formats (WebP with fallback)
- Include alt attributes with descriptive text
- Optimize file sizes
- Use responsive images with srcset

### Performance Optimization

- Minimize JavaScript
- Use code splitting
- Optimize CSS delivery
- Implement lazy loading for images
- Monitor Core Web Vitals

## Monitoring & Testing

### Tools to Use

1. **Google Search Console**: Monitor search performance
   - Submit sitemap
   - Monitor indexing issues
   - Track search queries and impressions
   - Monitor Core Web Vitals

2. **Google PageSpeed Insights**: Test page performance
   - Mobile and desktop performance
   - Core Web Vitals
   - SEO recommendations

3. **Lighthouse**: Built-in Chrome DevTools
   - Performance
   - SEO
   - Accessibility
   - Best Practices

4. **Schema.org Validator**: Validate structured data
   - Test JSON-LD markup
   - Fix schema errors

5. **Screaming Frog**: Crawl website for SEO issues
   - Duplicate content
   - Missing meta tags
   - Broken links
   - Redirect chains

## Future Enhancements

### Recommended Additions

1. **FAQ Schema**: Add FAQ section to About or Contact pages
   - Use `getStructuredDataFAQ()` utility

2. **Video Schema**: If adding video content
   - Add VideoObject schema markup

3. **Review Schema**: If adding customer reviews
   - Aggregate ratings and individual reviews

4. **Rich Snippets**: For rich search results
   - Recipes, reviews, products, etc.

5. **Hreflang Tags**: For multi-language support
   - Already included in index.html as template

6. **News Sitemap**: If publishing news/blog content
   - Submit to Google News

7. **Mobile App Schema**: If launching mobile app
   - Link to app stores

8. **AMP Support**: Accelerated Mobile Pages
   - For faster mobile loading

## Troubleshooting

### Pages Not Indexed

1. Check Google Search Console for errors
2. Verify robots.txt allows access
3. Ensure no meta robots noindex tag
4. Check for crawl errors

### Low Rankings

1. Review keyword relevance
2. Improve content quality and length
3. Build more high-quality backlinks
4. Improve Core Web Vitals
5. Increase content depth

### Duplicate Content Issues

1. Verify canonical URLs are set correctly
2. Check for URL parameters creating duplicates
3. Implement URL structure properly
4. Use rel=canonical when needed

## Contact & Support

For SEO-related questions or optimizations:
- Review Google Search Console regularly
- Monitor search performance and rankings
- Update content based on search query data
- Test new features in Search Console
