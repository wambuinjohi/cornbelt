import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import OrderForm from "@/components/OrderForm";
import { useUpdateMetaTags, pageMetadata, getStructuredDataProduct } from "@/lib/seo";
import { Check, Leaf, Shield, Zap, Droplets, ArrowRight } from "lucide-react";

export default function Products() {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>();

  const openOrderForm = (productName: string) => {
    setSelectedProduct(productName);
    setIsOrderFormOpen(true);
  };
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
        "https://cornbelt.co.ke/products",
        "https://cdn.builder.io/api/v1/image/assets%2Fb24c336a909d4dff96aafe9d145908a3%2Fbf12b883b24f4b35a0150306aaba9e88?format=webp&width=1200"
      ),
    });
  }, []);

  const products = [
    {
      id: "jirani",
      name: "Jirani Maize Meal",
      tagline: "Premium Fortified Maize Meal",
      description:
        "Our flagship product - premium fortified maize meal that nourishes your family with essential vitamins and minerals. Perfect for daily cooking and family meals.",
      image: "https://cdn.builder.io/api/v1/image/assets%2Fb24c336a909d4dff96aafe9d145908a3%2Fbf12b883b24f4b35a0150306aaba9e88?format=webp&width=800",
      features: [
        "Fortified with essential vitamins & minerals",
        "Fine, uniform texture",
        "High nutritional value",
        "Packaged for freshness",
      ],
      benefits: [
        "Supports family health",
        "Perfect for daily cooking",
        "Great taste and quality",
        "Affordable nutrition",
      ],
      sizes: ["2kg", "25kg"],
      cta: "Learn More",
    },
    {
      id: "tabasamu",
      name: "Tabasamu Maize Meal",
      tagline: "Grade 1 Sifted & Fortified",
      description:
        "Our premium Grade 1 sifted maize meal - carefully processed to ensure the finest quality flour with superior whiteness and consistency. Ideal for families who demand excellence.",
      image: "https://cdn.builder.io/api/v1/image/assets%2Fb24c336a909d4dff96aafe9d145908a3%2F56da549a08874f59b4805c00c67be84a?format=webp&width=800",
      features: [
        "Grade 1 premium quality",
        "Finely sifted texture",
        "Fortified with vitamins & minerals",
        "Superior whiteness",
      ],
      benefits: [
        "Finest quality flour",
        "Consistent quality",
        "Enhanced nutrition",
        "Premium taste",
      ],
      sizes: ["2kg", "25kg"],
      cta: "Learn More",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Our Premium Products
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover our range of fortified maize meal products, crafted with
                care and excellence for your family's nutrition.
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-primary/10"
                >
                  {/* Product Image */}
                  <div className="relative bg-primary/5 h-96 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-8">
                    {/* Header */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                        {product.tagline}
                      </p>
                      <h2 className="text-3xl font-bold text-foreground mt-2">
                        {product.name}
                      </h2>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Features */}
                    <div className="mb-8">
                      <h3 className="text-sm font-semibold text-foreground mb-4 uppercase">
                        Key Features
                      </h3>
                      <ul className="space-y-3">
                        {product.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div className="mb-8">
                      <h3 className="text-sm font-semibold text-foreground mb-4 uppercase">
                        Why Choose This Product
                      </h3>
                      <ul className="space-y-2">
                        {product.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-muted-foreground">
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Sizes */}
                    <div className="mb-8">
                      <h3 className="text-sm font-semibold text-foreground mb-3 uppercase">
                        Available Sizes
                      </h3>
                      <div className="flex gap-3">
                        {product.sizes.map((size) => (
                          <span
                            key={size}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-primary/10">
                      <a
                        href="https://wa.me/254"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                      >
                        Order Now
                        <ArrowRight className="w-4 h-4" />
                      </a>
                      <Link
                        to="/contact"
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold"
                      >
                        Inquire
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Benefits Section */}
            <div className="bg-primary/5 rounded-lg p-8 md:p-12 mb-16">
              <h2 className="text-3xl font-bold text-primary mb-8 text-center">
                Why Cornbelt Products?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Shield className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Quality Assured
                  </h3>
                  <p className="text-muted-foreground">
                    Rigorous quality control at every production stage
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Leaf className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Naturally Nutritious
                  </h3>
                  <p className="text-muted-foreground">
                    Fortified with essential vitamins and minerals
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Droplets className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Fresh & Pure
                  </h3>
                  <p className="text-muted-foreground">
                    Modern processing ensures maximum freshness
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Zap className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Family Approved
                  </h3>
                  <p className="text-muted-foreground">
                    Trusted by over 100,000 Kenyan families
                  </p>
                </div>
              </div>
            </div>

            {/* Nutritional Info Section */}
            <div className="max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-primary mb-8 text-center">
                Nutritional Excellence
              </h2>

              <div className="bg-background border border-primary/10 rounded-lg p-8">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  All Our Products Are Fortified With:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Vitamin A</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Vitamin B1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Vitamin B2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Niacin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Folate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Iron</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Zinc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Calcium</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Where to Buy Section */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">
                Where to Find Our Products
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Cornbelt products are available at leading retailers, shops, and
                supermarkets across Kenya. For wholesale inquiries or bulk orders,
                contact us directly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/254"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Order Wholesale
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold"
                >
                  Find a Retailer
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
