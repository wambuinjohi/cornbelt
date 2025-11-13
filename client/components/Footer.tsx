import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-foreground text-background">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fbf7a511dd4454ae88c7c49627a9a0f54%2F80b3bed3a8e14bf3ae5cc941d2cfab50?format=webp&width=100"
                alt="Cornbelt Logo"
                className="w-12 h-12 object-contain"
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
                <span>+254 (0) XXX XXX XXX</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
                <span>info@cornbelt.co.ke</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
                <span>Kenya</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-bold text-sm mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center hover:bg-secondary/30 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center hover:bg-secondary/30 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center hover:bg-secondary/30 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
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
            <a href="#" className="hover:opacity-100 transition-opacity">
              Privacy Policy
            </a>
            <a href="#" className="hover:opacity-100 transition-opacity">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
