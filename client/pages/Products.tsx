import { useEffect } from "react";
import { useUpdateMetaTags, pageMetadata, getStructuredDataProduct } from "@/lib/seo";
import Placeholder from "./Placeholder";

export default function Products() {
  useEffect(() => {
    useUpdateMetaTags({
      title: pageMetadata.products.title,
      description: pageMetadata.products.description,
      keywords: pageMetadata.products.keywords,
      ogTitle: pageMetadata.products.title,
      ogDescription: pageMetadata.products.description,
      ogUrl: "https://cornbelt.co.ke/products",
      canonicalUrl: "https://cornbelt.co.ke/products",
      twitterCard: "summary_large_image",
      structuredData: getStructuredDataProduct(
        "Cornbelt Premium Fortified Maize Meal",
        "Premium fortified maize flour and grain mill products from Kenya",
        "https://cornbeltmill.com/products",
        "https://cdn.builder.io/api/v1/image/assets%2Fbf7a511dd4454ae88c7c49627a9a0f54%2F80b3bed3a8e14bf3ae5cc941d2cfab50?format=webp&width=1200"
      ),
    });
  }, []);

  return (
    <Placeholder
      title="Our Products"
      description="This page is coming soon! We're preparing a detailed showcase of all our premium fortified maize meal products. Check back soon or contact us to learn more about our offerings."
    />
  );
}
