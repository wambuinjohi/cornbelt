import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Leaf, Award, Zap, ArrowRight, Check } from "lucide-react";

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-20 pb-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-96 h-96 bg-primary/10 rounded-full -top-48 -right-48 blur-3xl" />
            <div className="absolute w-96 h-96 bg-secondary/10 rounded-full -bottom-48 -left-48 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm font-medium text-primary">
                    Premium Quality Products
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Nourishing{" "}
                  <span className="text-primary">Quality Meals</span> From
                  Kenya's Finest
                </h1>

                <p className="text-lg text-muted-foreground max-w-xl">
                  Cornbelt Flour Mill Limited brings you fortified maize meal
                  products that combine tradition with modern nutrition. From
                  the farm, with love – Kenya's finest maize flour.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-base"
                  >
                    Explore Products
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold text-base"
                  >
                    Learn More
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-8">
                  <div>
                    <div className="text-2xl font-bold text-primary">25+</div>
                    <p className="text-sm text-muted-foreground">
                      Years in Business
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">100K+</div>
                    <p className="text-sm text-muted-foreground">
                      Happy Customers
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative h-96 md:h-full min-h-96 flex items-center justify-center">
                <div className="relative w-full h-full max-w-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl opacity-20 blur-2xl" />
                  <div className="relative bg-white rounded-3xl shadow-2xl p-8 h-full flex flex-col items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-b from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/20 rounded-2xl">
                          <span className="text-4xl">🌾</span>
                        </div>
                        <h3 className="text-2xl font-bold text-primary">
                          Jirani
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Fortified Maize Meal
                        </p>
                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-primary">
                          <span>★★★★★</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Cornbelt?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're committed to providing the highest quality fortified
                products that nourish families across Kenya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  100% Natural
                </h3>
                <p className="text-muted-foreground">
                  Made from the finest locally-sourced maize, processed with
                  care to maintain nutritional value.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-secondary/5 border border-secondary/10 hover:border-secondary/30 transition-colors">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Quality Certified
                </h3>
                <p className="text-muted-foreground">
                  All products meet international quality standards and are
                  fortified with essential vitamins and minerals.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Rapid Delivery
                </h3>
                <p className="text-muted-foreground">
                  Fast and reliable distribution network ensuring fresh products
                  reach your doorstep on time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Products
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Specially formulated to provide complete nutrition for your
                family.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Product Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-border">
                <div className="h-64 bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-6xl">🌾</div>
                    <p className="text-white font-semibold text-sm">
                      Jirani Maize Meal
                    </p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Jirani Fortified Maize Meal
                    </h3>
                    <p className="text-muted-foreground">
                      Our flagship product – premium quality fortified maize
                      meal enriched with essential vitamins and minerals.
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Grade 1 Sifted Maize
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Fortified with Vitamins & Minerals
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Available in Multiple Sizes
                    </li>
                  </ul>
                </div>
              </div>

              {/* Product Card 2 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-border">
                <div className="h-64 bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-6xl">🏆</div>
                    <p className="text-white font-semibold text-sm">
                      Tabasamu Maize Meal
                    </p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Tabasamu Grade 1 Maize Meal
                    </h3>
                    <p className="text-muted-foreground">
                      Premium quality grade 1 sifted maize meal with added
                      nutrition for growing families.
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Superior Quality
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Fortified Formula
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Perfect for All Ages
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold"
              >
                View All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Experience Quality?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of families across Kenya who trust Cornbelt for
              their daily nutrition needs.
            </p>
            <a
              href="https://wa.me/254"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-semibold text-base"
            >
              Contact Us on WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
