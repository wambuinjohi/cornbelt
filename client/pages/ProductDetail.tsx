import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { useUpdateMetaTags, getStructuredDataProduct } from "@/lib/seo";
import { Check, ArrowLeft, ArrowRight, Star, Shield, Leaf } from "lucide-react";

const PRODUCTS = {
  jirani: {
    id: "jirani",
    name: "Jirani Fortified Maize Meal",
    tagline: "Premium Fortified Maize Meal",
    shortDescription:
      "Our flagship premium product featuring Grade 1 sifted maize enriched with essential vitamins and minerals.",
    fullDescription:
      "Jirani Maize Meal is our flagship product - premium fortified maize meal that nourishes your family with essential vitamins and minerals. Each packet is carefully processed to ensure the finest quality flour with uniform texture and superior nutritional value. Perfect for daily cooking and family meals, Jirani brings together traditional milling excellence with modern fortification standards.",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F70ce74f71c7443cc97f0aac39bf3a2e2?format=webp&width=800",
    features: [
      "Grade 1 Sifted Maize",
      "Fortified with Vitamins & Minerals",
      "Multiple Sizes Available",
      "Perfect for All Ages",
      "Fine, uniform texture",
      "High nutritional value",
      "Packaged for freshness",
    ],
    benefits: [
      "Supports family health and development",
      "Perfect for daily cooking",
      "Great taste and superior quality",
      "Affordable nutrition for the whole family",
      "Trusted by Kenyan families for decades",
      "Consistent quality every time",
      "Easy to cook and prepare",
    ],
    sizes: ["2kg", "5kg", "10kg", "25kg"],
    keyNutrients: [
      "Vitamin A",
      "Vitamin B1",
      "Vitamin B2",
      "Niacin",
      "Folate",
      "Iron",
      "Zinc",
      "Calcium",
    ],
    rating: 4.8,
    reviews: 324,
  },
  tabasamu: {
    id: "tabasamu",
    name: "Tabasamu Grade 1 Maize Meal",
    tagline: "Superior Quality Grade 1 Maize Meal",
    shortDescription:
      "Our quality choice featuring superior Grade 1 sifted maize with added fortification for complete nutrition.",
    fullDescription:
      "Tabasamu Grade 1 Maize Meal represents our commitment to excellence and quality. This premium product is made from superior Grade 1 sifted maize, carefully processed to ensure the finest quality flour with exceptional whiteness and consistency. Ideal for families who demand excellence in their daily meals, Tabasamu combines traditional quality standards with modern nutritional fortification.",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F948057ebdd744e77a4a0eb1cca9a3e75?format=webp&width=800",
    features: [
      "Superior Quality Grade 1",
      "Fortified Formula",
      "Excellent Taste & Texture",
      "Family Favorite",
      "Finely sifted texture",
      "Superior whiteness",
      "Consistent quality",
    ],
    benefits: [
      "Finest quality flour for your family",
      "Enhanced nutrition for development",
      "Premium taste and exceptional texture",
      "Great value for quality",
      "Ideal for special meals and occasions",
      "Trusted quality you can depend on",
      "Versatile for all cooking styles",
    ],
    sizes: ["2kg", "5kg", "10kg", "25kg"],
    keyNutrients: [
      "Vitamin A",
      "Vitamin B1",
      "Vitamin B2",
      "Niacin",
      "Folate",
      "Iron",
      "Zinc",
      "Calcium",
    ],
    rating: 4.9,
    reviews: 412,
  },
};

type ProductKey = keyof typeof PRODUCTS;

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const product =
    productId && productId in PRODUCTS
      ? PRODUCTS[productId as ProductKey]
      : null;

  useEffect(() => {
    if (!product) {
      navigate("/products");
      return;
    }

    useUpdateMetaTags({
      title: `${product.name} | Cornbelt Flour Mill`,
      description: product.fullDescription,
      keywords: `maize meal, fortified flour, ${product.name.toLowerCase()}, cornbelt`,
      ogTitle: product.name,
      ogDescription: product.shortDescription,
      ogImage: product.image,
      ogUrl: `https://cornbelt.co.ke/products/${product.id}`,
      canonicalUrl: `https://cornbelt.co.ke/products/${product.id}`,
      twitterCard: "summary_large_image",
      structuredData: getStructuredDataProduct(
        product.name,
        product.fullDescription,
        `https://cornbelt.co.ke/products/${product.id}`,
        product.image,
      ),
    });
  }, [product, navigate]);

  if (!product) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-background border-b border-border">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-primary hover:underline">
                Home
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link to="/products" className="text-primary hover:underline">
                Products
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">
                {product.name}
              </span>
            </div>
          </div>
        </div>

        {/* Product Hero */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 md:px-6">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
          </div>
        </section>

        {/* Product Details */}
        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Product Image */}
              <div className="flex items-center justify-center">
                <div className="relative bg-primary/5 rounded-2xl overflow-hidden shadow-lg w-full aspect-square flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center space-y-8">
                {/* Header */}
                <div>
                  <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                    {product.tagline}
                  </p>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.fullDescription}
                </p>

                {/* Key Features */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Key Features
                  </h3>
                  <ul className="space-y-3">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Available Sizes
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <span
                        key={size}
                        className="px-5 py-3 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                  <a
                    href="https://wa.me/254"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-base"
                  >
                    Order Now
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link
                    to="/contact"
                    className="flex-1 inline-flex items-center justify-center px-6 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold text-base"
                  >
                    Get More Info
                  </Link>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-8">
                Why Choose {product.name}?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutritional Info */}
            <div className="bg-background border border-primary/10 rounded-2xl p-8 md:p-12 mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-8">
                Nutritional Excellence
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                All our products are fortified with essential vitamins and
                minerals to support the health and development of every family
                member.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {product.keyNutrients.map((nutrient) => (
                  <div
                    key={nutrient}
                    className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg"
                  >
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-medium text-foreground">
                      {nutrient}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cornbelt Commitment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-8 border border-border hover:border-primary/30 transition-colors">
                <Shield className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Quality Assured
                </h3>
                <p className="text-muted-foreground">
                  Rigorous quality control at every step ensures consistent
                  excellence and food safety standards.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 border border-border hover:border-primary/30 transition-colors">
                <Leaf className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Naturally Nutritious
                </h3>
                <p className="text-muted-foreground">
                  Fortified with essential nutrients to support optimal health
                  and family wellness.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 border border-border hover:border-primary/30 transition-colors">
                <Check className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Family Approved
                </h3>
                <p className="text-muted-foreground">
                  Trusted by over 100,000 Kenyan families for quality, taste,
                  and nutrition.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Experience {product.name}?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Available at supermarkets and retailers across Kenya. Order now
              and enjoy quality nutrition with every meal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="https://wa.me/254"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-semibold text-base"
              >
                Order on WhatsApp
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-primary-foreground text-primary-foreground rounded-lg hover:bg-primary-foreground/10 transition-colors font-semibold text-base"
              >
                View Other Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
