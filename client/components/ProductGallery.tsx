import { useState, useEffect } from "react";

interface ProductImage {
  id: number;
  productId: string;
  imageUrl: string;
  altText: string;
  displayOrder: number;
}

interface ProductGalleryProps {
  productId: string;
  productName: string;
  fallbackImage: string;
  fallbackAlt: string;
}

export default function ProductGallery({
  productId,
  productName,
  fallbackImage,
  fallbackAlt,
}: ProductGalleryProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductImages = async () => {
      try {
        const response = await fetch(`/api/product-images?productId=${productId}`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setImages(data);
        } else {
          setImages([
            {
              id: 0,
              productId,
              imageUrl: fallbackImage,
              altText: fallbackAlt,
              displayOrder: 0,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching product images:", error);
        setImages([
          {
            id: 0,
            productId,
            imageUrl: fallbackImage,
            altText: fallbackAlt,
            displayOrder: 0,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductImages();
  }, [productId, fallbackImage, fallbackAlt]);

  const currentImage = images[currentImageIndex] || {
    imageUrl: fallbackImage,
    altText: fallbackAlt,
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) {
    return (
      <div className="h-72 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-72 bg-gray-100 flex items-center justify-center overflow-hidden">
      <img
        src={currentImage.imageUrl}
        alt={currentImage.altText}
        className="w-full h-full object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors text-gray-800"
            aria-label="Previous image"
          >
            <svg
              className="w-5 h-5"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors text-gray-800"
            aria-label="Next image"
          >
            <svg
              className="w-5 h-5"
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

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
