"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetImageLoaderProps {
  assetKey?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: (error: Error) => void;
  showLoadingState?: boolean;
  showErrorState?: boolean;
  errorMessage?: string;
  loadingMessage?: string;
}

interface LoadingState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export function AssetImageLoader({
  assetKey,
  alt,
  width,
  height,
  className,
  fallbackSrc = "/images/default-placeholder.png",
  priority = false,
  fill = false,
  sizes,
  objectFit = "cover",
  onLoad,
  onError,
  showLoadingState = true,
  showErrorState = true,
  errorMessage = "Failed to load image",
  loadingMessage = "Loading image...",
}: AssetImageLoaderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    hasError: false,
  });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Generate the asset URL from the asset key
  const getAssetUrl = useCallback((key: string) => {
    return `/api/assets/${key}`;
  }, []);

  // Load the image with retry logic
  const loadImage = useCallback(async (src: string, attempt: number = 0) => {
    try {
      setLoadingState({ isLoading: true, hasError: false });
      
      // For asset URLs, trust the API endpoint and don't preload test
      if (src.startsWith('/api/assets/')) {
        return Promise.resolve(src);
      }
      
      // For other URLs, do the preload testing
      const img = new window.Image();
      
      return new Promise<string>((resolve, reject) => {
        img.onload = () => {
          resolve(src);
        };
        
        img.onerror = () => {
          reject(new Error(`Failed to load image: ${src}`));
        };
        
        // Set a timeout for the image load
        const timeout = setTimeout(() => {
          reject(new Error(`Image load timeout: ${src}`));
        }, 10000); // 10 second timeout
        
        img.onload = () => {
          clearTimeout(timeout);
          resolve(src);
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Failed to load image: ${src}`));
        };
        
        img.src = src;
      });
    } catch (error) {
      if (attempt < maxRetries) {
        // Retry after a delay
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        return loadImage(src, attempt + 1);
      }
      throw error;
    }
  }, [maxRetries]);

  // Effect to load the image when assetKey changes
  useEffect(() => {
    const loadAssetImage = async () => {
      if (!assetKey) {
        // No asset key provided, use fallback
        setImageSrc(fallbackSrc);
        setLoadingState({ isLoading: false, hasError: false });
        return;
      }

      try {
        const assetUrl = getAssetUrl(assetKey);
        
        // For asset URLs, trust the API and set immediately
        setImageSrc(assetUrl);
        setLoadingState({ isLoading: false, hasError: false });
        onLoad?.();
      } catch (error) {
        console.error("Asset image load error:", error);
        
        // Try fallback image
        if (fallbackSrc) {
          setImageSrc(fallbackSrc);
          setLoadingState({ isLoading: false, hasError: false });
        } else {
          setLoadingState({
            isLoading: false,
            hasError: true,
            errorMessage: errorMessage,
          });
          onError?.(error instanceof Error ? error : new Error("Unknown error"));
        }
      }
    };

    loadAssetImage();
  }, [assetKey, fallbackSrc, getAssetUrl, loadImage, onLoad, onError, errorMessage]);

  // Retry function
  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setLoadingState({ isLoading: true, hasError: false });
      
      // Trigger reload
      if (assetKey) {
        const assetUrl = getAssetUrl(assetKey);
        setImageSrc(assetUrl);
        setLoadingState({ isLoading: false, hasError: false });
      }
    }
  }, [retryCount, maxRetries, assetKey, getAssetUrl]);

  // Loading state
  if (loadingState.isLoading && showLoadingState) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <div className="flex flex-col items-center space-y-2 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-xs">{loadingMessage}</span>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingState.hasError && showErrorState) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg border-2 border-dashed border-muted-foreground/20",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <div className="flex flex-col items-center space-y-2 text-muted-foreground p-4 text-center">
          <AlertCircle className="w-6 h-6" />
          <span className="text-xs">{loadingState.errorMessage}</span>
          {retryCount < maxRetries && (
            <button
              onClick={handleRetry}
              className="text-xs text-primary hover:text-primary/80 underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Success state - render the image
  if (imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        unoptimized={!!assetKey} // Skip optimization for Asset Manager URLs
        className={cn(
          "transition-opacity duration-200",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down",
          className
        )}
        onLoad={() => {
          setLoadingState({ isLoading: false, hasError: false });
          onLoad?.();
        }}
        onError={(error) => {
          console.error("Next.js Image component error:", error);
          setLoadingState({
            isLoading: false,
            hasError: true,
            errorMessage: "Image failed to display",
          });
          onError?.(new Error("Image failed to display"));
        }}
      />
    );
  }

  // Fallback placeholder when no image source is available
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted rounded-lg",
        fill ? "absolute inset-0" : "",
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
    </div>
  );
}

// Specialized version for lazy loading with intersection observer
interface LazyAssetImageLoaderProps extends AssetImageLoaderProps {
  rootMargin?: string;
  threshold?: number;
}

export function LazyAssetImageLoader({
  rootMargin = "50px",
  threshold = 0.1,
  ...props
}: LazyAssetImageLoaderProps) {
  const [isInView, setIsInView] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(elementRef);

    return () => observer.disconnect();
  }, [elementRef, rootMargin, threshold]);

  if (!isInView) {
    return (
      <div
        ref={setElementRef}
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg",
          props.fill ? "absolute inset-0" : "",
          props.className
        )}
        style={!props.fill ? { width: props.width, height: props.height } : undefined}
      >
        <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
      </div>
    );
  }

  return <AssetImageLoader {...props} />;
}

// Hook for programmatic image loading
export function useAssetImageLoader(assetKey?: string | null) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    hasError: false,
  });
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const loadImage = useCallback(async (key: string) => {
    setLoadingState({ isLoading: true, hasError: false });
    
    try {
      const assetUrl = `/api/assets/${key}`;
      
      // Test if the image loads
      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = assetUrl;
      });
      
      setImageSrc(assetUrl);
      setLoadingState({ isLoading: false, hasError: false });
      return assetUrl;
    } catch (error) {
      setLoadingState({
        isLoading: false,
        hasError: true,
        errorMessage: "Failed to load image",
      });
      throw error;
    }
  }, []);

  useEffect(() => {
    if (assetKey) {
      loadImage(assetKey).catch(console.error);
    } else {
      setImageSrc(null);
      setLoadingState({ isLoading: false, hasError: false });
    }
  }, [assetKey, loadImage]);

  return {
    imageSrc,
    isLoading: loadingState.isLoading,
    hasError: loadingState.hasError,
    errorMessage: loadingState.errorMessage,
    reload: () => assetKey && loadImage(assetKey),
  };
}