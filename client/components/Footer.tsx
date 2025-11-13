import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

interface FooterSettings {
  id: number;
  phone: string;
  email: string;
  location: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [footerData, setFooterData] = useState<FooterSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await fetch("/api/footer-settings");
        const data = await response.json();
        if (data && typeof data === "object" && data.id) {
          setFooterData(data);
        }
      } catch (error) {
        console.error("Error fetching footer settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterSettings();
  }, []);

  return (
    <footer className="w-full bg-foreground text-background">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fbf7a511dd4454ae88c7c49627a9a0f54%2Fd8583999ed7547f6a7bc07d8b36fb205?format=webp&width=800"
                alt="Cornbelt Logo"
                className="w-20 h-20 object-contain"
              />
              <div>
                <div className="font-bold text-lg">CORNBELT</div>
                <div className="text-sm opacity-75">FLOUR MILL</div>
              </div>
            </div>
            <p className="text-sm opacity-80">
              Where Earth's bounty is processed to nourishing meals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-sm mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
                <span>
                  {isLoading
                    ? "Loading..."
                    : footerData?.phone || "+254 (0) XXX XXX XXX"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
                <span>
                  {isLoading
                    ? "Loading..."
                    : footerData?.email || "info@cornbelt.co.ke"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
                <span>
                  {isLoading ? "Loading..." : footerData?.location || "Kenya"}
                </span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-bold text-sm mb-4">Follow Us</h3>
            <div className="flex gap-3">
              {!isLoading && footerData?.facebookUrl && (
                <a
                  href={footerData.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center hover:bg-secondary/30 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {!isLoading && footerData?.instagramUrl && (
                <a
                  href={footerData.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center hover:bg-secondary/30 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {!isLoading && footerData?.twitterUrl && (
                <a
                  href={footerData.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center hover:bg-secondary/30 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row items-center justify-between text-sm opacity-75">
          <p>
            &copy; {currentYear} Cornbelt Flour Mill Limited. All rights
            reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link
              to="/privacy-policy"
              className="hover:opacity-100 transition-opacity"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="hover:opacity-100 transition-opacity"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
