import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageLoadingBar from "./components/PageLoadingBar";
import { useVisitorTracking } from "./hooks/use-visitor-tracking";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AdminSetup from "./pages/AdminSetup";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHeroImages from "./pages/AdminHeroImages";
import AdminSubmissions from "./pages/AdminSubmissions";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminFooter from "./pages/AdminFooter";
import AdminChat from "./pages/AdminChat";
import AdminOrders from "./pages/AdminOrders";
import AdminVisitorTracking from "./pages/AdminVisitorTracking";

const queryClient = new QueryClient();

const AppContent = () => {
  useVisitorTracking();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:productId" element={<ProductDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/admin/setup" element={<AdminSetup />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/hero-images" element={<AdminHeroImages />} />
      <Route path="/admin/submissions" element={<AdminSubmissions />} />
      <Route path="/admin/testimonials" element={<AdminTestimonials />} />
      <Route path="/admin/footer" element={<AdminFooter />} />
      <Route path="/admin/chat" element={<AdminChat />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route
        path="/admin/visitor-tracking"
        element={<AdminVisitorTracking />}
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageLoadingBar />
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
