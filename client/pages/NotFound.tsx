import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUpdateMetaTags, pageMetadata } from "@/lib/seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );

    useUpdateMetaTags({
      title: pageMetadata.notfound.title,
      description: pageMetadata.notfound.description,
      keywords: pageMetadata.notfound.keywords,
      canonicalUrl: `https://cornbeltmill.com${location.pathname}`,
    });
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center space-y-6">
          <div className="text-6xl font-bold text-primary mb-4">404</div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Sorry, the page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Go Back Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
