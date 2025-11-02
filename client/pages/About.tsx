import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { useUpdateMetaTags, pageMetadata, getStructuredDataOrganization } from "@/lib/seo";
import {
  Leaf,
  Award,
  Zap,
  Target,
  Heart,
  Handshake,
  Lightbulb,
  Users,
} from "lucide-react";

export default function About() {
  useEffect(() => {
    useUpdateMetaTags({
      title: pageMetadata.about.title,
      description: pageMetadata.about.description,
      keywords: pageMetadata.about.keywords,
      ogTitle: pageMetadata.about.title,
      ogDescription: pageMetadata.about.description,
      ogImage: "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F4a2cc68749f24d2b8f3d41537c67e99d?format=webp&width=1200",
      ogUrl: "https://cornbeltmill.com/about",
      canonicalUrl: "https://cornbeltmill.com/about",
      twitterCard: "summary_large_image",
      structuredData: getStructuredDataOrganization("https://cornbeltmill.com/about"),
    });
  }, []);
  const coreValues = [
    {
      icon: Heart,
      title: "Integrity",
      description:
        "We operate with honesty and transparency, building trust within our customers and staff.",
    },
    {
      icon: Handshake,
      title: "Caring",
      description: "We prioritize exceptional service to our customers.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "We are dedicated to maintaining the highest standards in every aspect of our customers' services.",
    },
    {
      icon: Users,
      title: "Accessibility",
      description:
        "We prioritize the needs and preferences of our customers and strive to create memorable experiences. We ensure that every customer feels valued and satisfied, fostering loyalty and building lasting relationships.",
    },
    {
      icon: Lightbulb,
      title: "Teamwork",
      description:
        "We believe in the power of teamwork, fostering an environment where every staff member is valued. By working together, we enhance customer experiences and achieve our common goals, creating a supportive and united community that reflects our commitment to excellence.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                About Cornbelt Flour Mill Limited
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From subsistence farming to thriving enterprise – our journey of
                quality, innovation, and community impact
              </p>
            </div>
          </div>
        </section>

        {/* Company History */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Cornbelt Flour Mill Limited was established by Mr. Ngure
                    Muchune Paul with the aim of improving the livelihoods of
                    communities. Through his early stages of life, he noticed
                    that much focus in farming activities was placed on
                    subsistence farming which did not project a lot of sense
                    from an economic perspective. Therefore, in 2003 as a way of
                    engaging in profitable economic activities, he decided to
                    venture into the business of buying and selling of maize and
                    other cereals.
                  </p>

                  <p>
                    This arrangement picked up exceptionally well and sustained
                    despite intense competition, cheap products, and high costs
                    that were being experienced in the market. Owing to the
                    challenges encountered and experience gained, he decided to
                    venture into a setup that would add value to farm produce.
                    He therefore registered a firm in 2014 under the name of
                    Cornbelt Flour Mill.
                  </p>

                  <p>
                    In 2015, he installed a maize flour mill with a capacity of
                    15 tons per day. The demand grew over time and he was able
                    to match it through installation of high capacity machines.
                    The business picked up well and in 2018 the business was
                    converted to a Private Limited Company and rented land from
                    the National Cereals & Produce Board to manage the capacity.
                    The land also came in handy for purposes of installation of
                    bigger machines and adequate space for warehouse and other
                    infrastructural amenities.
                  </p>
                </div>
              </div>

              {/* Facility Showcase */}
              <div className="mt-12 space-y-6">
                <h3 className="text-2xl font-bold text-primary">
                  Our Modern Facility
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F4a2cc68749f24d2b8f3d41537c67e99d?format=webp&width=800"
                    alt="Cornbelt facility building"
                    className="rounded-lg shadow-lg object-cover h-64 w-full"
                  />
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2Fc0b896d25ac84b8e9382dd61577b5a45?format=webp&width=800"
                    alt="Milling equipment and machinery"
                    className="rounded-lg shadow-lg object-cover h-64 w-full"
                  />
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F55c0c6e3f31e42738894312205f182a7?format=webp&width=800"
                    alt="Storage warehouse facility"
                    className="rounded-lg shadow-lg object-cover h-64 w-full"
                  />
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2Fb22c9c0270ed47d8bb4da53c14df93e1?format=webp&width=800"
                    alt="Raw maize storage"
                    className="rounded-lg shadow-lg object-cover h-64 w-full"
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="text-2xl font-bold text-primary mb-2">
                    2003
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Started maize and cereal trading business
                  </p>
                </div>
                <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="text-2xl font-bold text-primary mb-2">
                    2014
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Registered Cornbelt Flour Mill
                  </p>
                </div>
                <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="text-2xl font-bold text-primary mb-2">
                    2015
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Installed 15-ton capacity mill
                  </p>
                </div>
                <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="text-2xl font-bold text-primary mb-2">
                    2018
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Converted to Private Limited Company
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 text-center">
                Our Vision & Mission
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Vision */}
                <div className="bg-background p-8 rounded-lg border border-primary/10 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-8 h-8 text-primary flex-shrink-0" />
                    <h3 className="text-2xl font-bold text-primary">Vision</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To be the best producer/manufacturer of high quality and
                    affordable milled cereal products in Kenya and beyond.
                  </p>
                </div>

                {/* Mission */}
                <div className="bg-background p-8 rounded-lg border border-primary/10 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Leaf className="w-8 h-8 text-primary flex-shrink-0" />
                    <h3 className="text-2xl font-bold text-primary">Mission</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To source for high quality cereal produce at the best terms,
                    store, process and deliver the end products using the best
                    practice and technology that exceeds clients' expectations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 text-center">
                Our Core Values
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {coreValues.map((value) => {
                  const Icon = value.icon;
                  return (
                    <div
                      key={value.title}
                      className="bg-primary/5 p-8 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-xl font-bold text-primary mb-2">
                            {value.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {value.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-24 bg-primary/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">
                Experience Our Commitment
              </h2>
              <p className="text-lg text-muted-foreground">
                Discover the quality and care that goes into every product. From
                our farm to your family, excellence is our promise.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-base"
                >
                  View Our Products
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold text-base"
                >
                  Get In Touch
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
