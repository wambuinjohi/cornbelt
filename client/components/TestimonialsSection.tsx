import { useState, useEffect } from "react";

interface Testimonial {
  id: number;
  fullName: string;
  location: string;
  testimonialText: string;
  imageUrl?: string;
  rating: number;
  displayOrder: number;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    fullName: "Margaret Kipchoge",
    location: "Nairobi, Kenya",
    testimonialText:
      "Cornbelt products have become a staple in our home. The quality is unmatched and my family loves the taste!",
    rating: 5,
    displayOrder: 1,
  },
  {
    id: 2,
    fullName: "James Mwangi",
    location: "Kisumu, Kenya",
    testimonialText:
      "I trust Cornbelt for my kids' nutrition. The fortification gives me peace of mind knowing they're getting quality nutrition.",
    rating: 5,
    displayOrder: 2,
  },
  {
    id: 3,
    fullName: "Grace Omondi",
    location: "Mombasa, Kenya",
    testimonialText:
      "The best maize meal I've used. Consistent quality, great taste, and I can always find it at my local shop!",
    rating: 5,
    displayOrder: 3,
  },
];

import { fetchJsonIfApi } from "@/lib/apiClient";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await fetchJsonIfApi<Testimonial[]>("/api/testimonials");
      if (cancelled) return;
      if (Array.isArray(data) && data.length > 0) {
        setTestimonials(data);
      } else {
        setTestimonials(defaultTestimonials);
      }
      setIsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of Kenyan families who trust Cornbelt for quality
              nutrition
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20 animate-pulse"
              >
                <div className="h-4 bg-primary/20 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-primary/20 rounded"></div>
                  <div className="h-3 bg-primary/20 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of Kenyan families who trust Cornbelt for quality
            nutrition
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20 hover:border-primary/40 transition-colors"
            >
              {testimonial.imageUrl && (
                <div className="mb-4 -mx-8 -mt-8 h-48 overflow-hidden rounded-t-2xl">
                  <img
                    src={testimonial.imageUrl}
                    alt={testimonial.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-secondary text-lg">
                    ★
                  </span>
                ))}
                {[...Array(5 - testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-gray-300 text-lg">
                    ★
                  </span>
                ))}
              </div>

              <p className="text-foreground mb-4 italic">
                "{testimonial.testimonialText}"
              </p>

              <div>
                <p className="font-semibold text-foreground">
                  {testimonial.fullName}
                </p>
                {testimonial.location && (
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
