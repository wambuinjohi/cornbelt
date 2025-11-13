import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table: "newsletter_requests",
          email: email.trim(),
          createdAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Thanks for subscribing! Check your email soon.");
        setEmail("");
      } else {
        toast.error(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">
            Stay Updated
          </h3>
          <p className="text-muted-foreground text-lg">
            Get news about new products, recipes, and nutrition tips from
            Cornbelt Flour Mill
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-3">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
