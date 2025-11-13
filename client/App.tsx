import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageLoadingBar from "./components/PageLoadingBar";
import { useVisitorTracking } from "./hooks/use-visitor-tracking";
import { AuthProvider, useAuth } from "./lib/authContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import AdminNewsletter from "./pages/AdminNewsletter";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isLoading: authLoading } = useAuth();
  useVisitorTracking();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hero-images"
        element={
          <ProtectedRoute>
            <AdminHeroImages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/submissions"
        element={
          <ProtectedRoute>
            <AdminSubmissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/testimonials"
        element={
          <ProtectedRoute>
            <AdminTestimonials />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/footer"
        element={
          <ProtectedRoute>
            <AdminFooter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/chat"
        element={
          <ProtectedRoute>
            <AdminChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/visitor-tracking"
        element={
          <ProtectedRoute>
            <AdminVisitorTracking />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageLoadingBar />
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
