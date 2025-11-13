import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUpdateMetaTags, pageMetadata } from "@/lib/seo";

export default function PrivacyPolicy() {
  useEffect(() => {
    useUpdateMetaTags({
      title: pageMetadata.privacy.title,
      description: pageMetadata.privacy.description,
      keywords: pageMetadata.privacy.keywords,
      ogTitle: pageMetadata.privacy.title,
      ogDescription: pageMetadata.privacy.description,
      ogUrl: "https://cornbelt.co.ke/privacy-policy",
      canonicalUrl: "https://cornbelt.co.ke/privacy-policy",
      twitterCard: "summary",
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                1. Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Cornbelt Flour Mill Limited ("we," "our," or "us") is committed
                to protecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                visit our website and use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                2. Information We Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may collect information about you in a variety of ways. The
                information we may collect on the site includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>Personal Data:</strong> Name, email address, phone
                  number, mailing address, and payment information when you make
                  a purchase or contact us
                </li>
                <li>
                  <strong>Device Information:</strong> Device type, operating
                  system, browser type, and IP address
                </li>
                <li>
                  <strong>Usage Data:</strong> Pages visited, time spent on
                  pages, links clicked, and other browsing behavior
                </li>
                <li>
                  <strong>Cookies and Tracking:</strong> Data collected through
                  cookies and similar tracking technologies
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                3. How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use the information we collect for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>To process and fulfill your orders</li>
                <li>To send you promotional emails and marketing materials</li>
                <li>To improve our website and services</li>
                <li>
                  To respond to your inquiries and customer support requests
                </li>
                <li>To analyze website traffic and user behavior</li>
                <li>To comply with legal obligations</li>
                <li>To prevent fraud and enhance security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                4. Disclosure of Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose your information when required by law or when we
                believe in good faith that such disclosure is necessary to:
                protect our rights, your safety, or the safety of others;
                enforce our Terms of Service; or prevent fraud. We do not sell,
                trade, or transfer your personally identifiable information to
                outside parties without your consent, except as necessary to
                process your transactions or as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                5. Security of Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. However, no
                method of transmission over the Internet or electronic storage
                is 100% secure. While we strive to use commercially acceptable
                means to protect your personal information, we cannot guarantee
                its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                6. Cookies and Tracking Technologies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may use cookies and similar tracking technologies to
                enhance your experience. These technologies help us understand
                how you use our website and improve our services. You can
                control cookie settings through your browser, but disabling
                cookies may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                7. Third-Party Links
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may contain links to third-party websites. We are
                not responsible for the privacy practices or content of these
                external sites. We encourage you to review the privacy policies
                of any third-party websites before providing your personal
                information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                8. Your Rights and Choices
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Depending on your location, you may have certain rights
                regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Right to access your personal information</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to request deletion of your data</li>
                <li>Right to opt-out of marketing communications</li>
                <li>Right to data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                9. Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website is not intended for children under the age of 13. We
                do not knowingly collect personal information from children
                under 13. If we become aware that we have collected information
                from a child under 13, we will take steps to delete such
                information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                10. Changes to This Privacy Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the updated Privacy Policy
                on our website and updating the "Last updated" date at the top
                of this page. Your continued use of the website following the
                posting of revised Privacy Policy means that you accept and
                agree to the changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                11. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy or our privacy
                practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-foreground font-semibold">
                  Cornbelt Flour Mill Limited
                </p>
                <p className="text-muted-foreground">
                  Email: info@cornbelt.co.ke
                </p>
                <p className="text-muted-foreground">Location: Kenya</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
