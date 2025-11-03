import { useState, useEffect } from "react";

interface Slide {
  url: string;
  alt: string;
}

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);

  // Default fallback images
  const defaultSlides: Slide[] = [
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2Fffba8e3c2b3042bab528316b71e4306e%2F07c09f7eb8a147d0a4f8250381fcf15e?format=webp&width=800",
      alt: "Cornbelt custom uploaded image",
    },
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F5faa80f695624fab98c4b8cdbca4e0d7?format=webp&width=800",
      alt: "Cornbelt flour mill billboard advertisement",
    },
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F0d117e54429f404bb6e71a4b18a98876?format=webp&width=800",
      alt: "Cornbelt products display",
    },
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F9e37a8d9c5764cbe9c1a6a45fb44d6b8?format=webp&width=800",
      alt: "Cornbelt facility and signage",
    },
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F85026c8a3cf94c89a4204f2ddfec1703?format=webp&width=800",
      alt: "Cornbelt marketing campaign",
    },
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2Fa2d86d9f4ad945de88fded66d899beed?format=webp&width=800",
      alt: "Jirani maize meal promotion",
    },
  ];

  // Fetch images from API
  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        const response = await fetch("/api/hero-images");
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const mappedSlides = data.map((image: any) => ({
            url: image.imageUrl,
            alt: image.altText || "Hero slider image",
          }));
          setSlides(mappedSlides);
        } else {
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.error("Error fetching slider images:", error);
        setSlides(defaultSlides);
      }
    };

    fetchSliderImages();
  }, []);

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.url}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
        aria-label="Previous slide"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
        aria-label="Next slide"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
