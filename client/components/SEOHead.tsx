import { useEffect } from "react";
import { useUpdateMetaTags, SEOMetadata } from "@/lib/seo";

interface SEOHeadProps extends SEOMetadata {}

export default function SEOHead(props: SEOHeadProps) {
  useEffect(() => {
    useUpdateMetaTags(props);
  }, [props]);

  return null;
}
