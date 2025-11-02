import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ProductGallery from "@/components/ProductGallery";
import TestimonialsSection from "@/components/TestimonialsSection";
import ChatWidget from "@/components/ChatWidget";
import {
  useUpdateMetaTags,
  pageMetadata,
  getStructuredDataOrganization,
  getStructuredDataBreadcrumb,
} from "@/lib/seo";
import {
  Leaf,
  Award,
  Zap,
  ArrowRight,
  Check,
  Droplets,
  Shield,
  Truck,
  Factory,
  Users,
  Lightbulb,
} from "lucide-react";

export default function Index() {
  useEffect(() => {
    useUpdateMetaTags({
      title: pageMetadata.home.title,
      description: pageMetadata.home.description,
      keywords: pageMetadata.home.keywords,
      ogTitle: pageMetadata.home.title,
      ogDescription: pageMetadata.home.description,
      ogImage:
        "https://cdn.builder.io/api/v1/image/assets%2Fbf7a511dd4454ae88c7c49627a9a0f54%2F80b3bed3a8e14bf3ae5cc941d2cfab50?format=webp&width=1200",
      ogUrl: "https://cornbelt.co.ke/",
      canonicalUrl: "https://cornbelt.co.ke/",
      twitterCard: "summary_large_image",
      structuredData: getStructuredDataOrganization("https://cornbelt.co.ke/"),
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden h-screen max-h-screen flex items-center justify-center">
          {/* Background Slider */}
          <div className="absolute inset-0">
            <HeroSlider />
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center space-y-8 mb-12">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fbf7a511dd4454ae88c7c49627a9a0f54%2F80b3bed3a8e14bf3ae5cc941d2cfab50?format=webp&width=200"
                alt="Cornbelt Logo"
                className="w-24 h-24 mx-auto object-contain"
              />
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                  From The Farm, With{" "}
                  <span className="text-secondary">Love</span>
                </h1>
                <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
                  Kenya's finest fortified maize flour – nourishing families
                  with quality, tradition, and excellence since our founding.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-base"
                >
                  Shop Our Products
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="https://wa.me/254"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold text-base"
                >
                  Contact Us
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2 drop-shadow">
                  25+
                </div>
                <p className="text-sm md:text-base text-white/80 drop-shadow">
                  Years Operating
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2 drop-shadow">
                  100K+
                </div>
                <p className="text-sm md:text-base text-white/80 drop-shadow">
                  Happy Families
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2 drop-shadow">
                  2
                </div>
                <p className="text-sm md:text-base text-white/80 drop-shadow">
                  Premium Products
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Premium Products
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Fortified with essential vitamins and minerals for your family's
                health
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Jirani Product */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-border">
                <ProductGallery
                  productId="jirani"
                  productName="Jirani Fortified Maize Meal"
                  fallbackImage="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F70ce74f71c7443cc97f0aac39bf3a2e2?format=webp&width=800"
                  fallbackAlt="Jirani Fortified Maize Meal packaging"
                />
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Jirani Fortified Maize Meal
                    </h3>
                    <p className="text-muted-foreground">
                      Our flagship premium product featuring Grade 1 sifted
                      maize enriched with essential vitamins and minerals.
                    </p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Grade 1 Sifted Maize</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Fortified with Vitamins & Minerals</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Multiple Sizes Available</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Perfect for All Ages</span>
                    </li>
                  </ul>
                  <button className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Tabasamu Product */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-border">
                <ProductGallery
                  productId="tabasamu"
                  productName="Tabasamu Grade 1 Maize Meal"
                  fallbackImage="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F948057ebdd744e77a4a0eb1cca9a3e75?format=webp&width=800"
                  fallbackAlt="Tabasamu Grade 1 Maize Meal packaging"
                />
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Tabasamu Grade 1 Maize Meal
                    </h3>
                    <p className="text-muted-foreground">
                      Our quality choice featuring superior Grade 1 sifted maize
                      with added fortification for complete nutrition.
                    </p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Superior Quality Grade</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Fortified Formula</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Excellent Taste & Texture</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Family Favorite</span>
                    </li>
                  </ul>
                  <button className="w-full py-3 px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-semibold">
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold"
              >
                View All Products & Sizes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Cornbelt Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Cornbelt?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Committed to excellence, quality, and nourishing every family in
                Kenya
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-white border border-border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  100% Natural
                </h3>
                <p className="text-muted-foreground">
                  Made from locally-sourced maize, processed with care to
                  maintain nutritional value and authentic taste.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-white border border-border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Quality Certified
                </h3>
                <p className="text-muted-foreground">
                  All products meet international quality standards and are
                  fortified with essential vitamins and minerals.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-white border border-border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Fast Delivery
                </h3>
                <p className="text-muted-foreground">
                  Reliable distribution network ensuring fresh products reach
                  your home on time, every time.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-2xl bg-white border border-border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Droplets className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Fortified Nutrition
                </h3>
                <p className="text-muted-foreground">
                  Enhanced with vitamins and minerals to support the health and
                  development of every family member.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-8 rounded-2xl bg-white border border-border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Trusted Brand
                </h3>
                <p className="text-muted-foreground">
                  Over 25 years of experience serving Kenyan families with
                  excellence and dedication to quality.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-8 rounded-2xl bg-white border border-border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Innovative Processing
                </h3>
                <p className="text-muted-foreground">
                  Modern milling technology combined with traditional quality to
                  bring you the best maize meal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Cornbelt Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    About Cornbelt Flour Mill
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    For over 25 years, Cornbelt Flour Mill Limited has been
                    dedicated to processing Kenya's finest maize into premium
                    quality products that nourish families across the nation.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">
                    Our Mission
                  </h3>
                  <p className="text-muted-foreground">
                    Where Earth's bounty is processed to nourishing meals. We
                    believe in bringing wholesome nutrition to every Kenyan
                    family through quality products and honest practices.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">
                    Our Commitment
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Premium quality ingredients sourced locally</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>State-of-the-art milling and processing</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Fortification with essential nutrients</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Consistent quality across all products</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
                  <Factory className="w-16 h-16 text-primary mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Modern Facility
                  </h3>
                  <p className="text-muted-foreground">
                    Our state-of-the-art milling facility is equipped with the
                    latest technology to ensure consistent quality and hygiene
                    standards.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
                  <Users className="w-16 h-16 text-primary mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Expert Team
                  </h3>
                  <p className="text-muted-foreground">
                    Our dedicated team of milling experts and quality control
                    professionals ensure every batch meets our high standards.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
                  <Zap className="w-16 h-16 text-primary mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Continuous Innovation
                  </h3>
                  <p className="text-muted-foreground">
                    We invest in new technology and processes to continually
                    improve our products and serve you better.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Features Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Product Features & Benefits
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover what makes Cornbelt products the choice of families
                across Kenya
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  🌾 Jirani: The Premium Choice
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-lg">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Grade 1 Sifted Maize
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Premium quality, perfectly refined
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-lg">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Fortified with Vitamins & Minerals
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Enhanced nutrition for growing families
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-lg">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Perfect Texture & Taste
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Smooth, consistent quality every time
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-lg">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Available in Multiple Sizes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        From small packets to bulk sizes
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  😊 Tabasamu: The Family Favorite
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-secondary font-bold text-lg">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Superior Quality Grade 1
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Excellent sifting and processing
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary font-bold text-lg">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Enhanced Fortification
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Additional vitamins for health
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary font-bold text-lg">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Authentic Home-Milled Taste
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Traditional quality modern processing
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary font-bold text-lg">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        Affordable Quality
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Great value for the whole family
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Brand Presence Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Cornbelt in Your Community
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find us at retailers, markets, and events across Kenya
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F5ff5547835bc43a1b1765ac4be6ec727?format=webp&width=800"
                  alt="Cornbelt teardrop flag at events"
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-foreground">
                    Event Marketing
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Cornbelt at community events
                  </p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F16328bab2c0943c487599e9b3169b599?format=webp&width=800"
                  alt="Cornbelt rollup banner display"
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-foreground">
                    Brand Displays
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Visible in stores nationwide
                  </p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F64d7a753a7854a4bab6cb64fcedc87d9?format=webp&width=800"
                  alt="Jirani with families in communities"
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-foreground">
                    Community Trust
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Trusted by Kenyan families
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2Ff82178ff7d644c3a9cabfabe9e223a8f?format=webp&width=800"
                  alt="Jirani maize meal packaging showcase"
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2Ff174d02acd5d44648136ae62db46a06a?format=webp&width=800"
                  alt="Jirani products in retail environment"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It's Made Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Quality Process
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From farm to table – ensuring excellence at every step
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Selection
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    We carefully select the finest locally-grown maize from
                    trusted farmers
                  </p>
                </div>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F55c0c6e3f31e42738894312205f182a7?format=webp&width=800"
                  alt="Raw maize selection and storage"
                  className="rounded-lg shadow-lg w-full object-cover h-48"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Cleaning & Processing
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Thorough cleaning and inspection to remove impurities and
                    debris using advanced technology
                  </p>
                </div>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2Fc0b896d25ac84b8e9382dd61577b5a45?format=webp&width=800"
                  alt="Milling and processing equipment"
                  className="rounded-lg shadow-lg w-full object-cover h-48"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                      3
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Milling & Fortification
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Advanced milling technology to achieve perfect texture with
                    essential vitamins and minerals
                  </p>
                </div>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2Fb22c9c0270ed47d8bb4da53c14df93e1?format=webp&width=800"
                  alt="Industrial maize processing facility"
                  className="rounded-lg shadow-lg w-full object-cover h-48"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                      4
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Quality & Distribution
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Rigorous testing and hygienic packaging ensures products
                    reach customers fresh and on time
                  </p>
                </div>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F899164802be54df0a1d17b956615ba47?format=webp&width=800"
                  alt="Final product packaging and quality control"
                  className="rounded-lg shadow-lg w-full object-cover h-48"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              The Taste of Home, Milled to Perfection
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of Kenyan families enjoying superior nutrition with
              every meal. Available at supermarkets and retailers near you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="https://wa.me/254"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-semibold text-base"
              >
                Order Now on WhatsApp
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-primary-foreground text-primary-foreground rounded-lg hover:bg-primary-foreground/10 transition-colors font-semibold text-base"
              >
                Get Bulk Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-background border-t border-border">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h3 className="text-2xl font-bold text-foreground">
                Stay Updated
              </h3>
              <p className="text-muted-foreground">
                Get news about new products, recipes, and nutrition tips from
                Cornbelt Flour Mill
              </p>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                  Subscribe
                </button>
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
