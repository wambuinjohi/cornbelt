import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageLoadingBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          return prev + Math.random() * 30;
        }
        return prev;
      });
    }, 200);

    return () => {
      clearInterval(progressInterval);
    };
  }, [location]);

  useEffect(() => {
    const completeLoad = setTimeout(() => {
      setProgress(100);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(completeLoad);
  }, [location]);

  if (!isLoading && progress === 100) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 z-[9999] h-1 bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        opacity: isLoading ? 1 : 0,
      }}
    />
  );
}
