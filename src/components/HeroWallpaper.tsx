import { useState, useEffect } from "react";

interface HeroWallpaperProps {
  mediaUrl: string;
  mediaType?: "image" | "video" | "auto";
  overlay?: boolean;
  title?: string;
  subtitle?: string;
  height?: string;
}

export function HeroWallpaper({
  mediaUrl,
  mediaType = "auto",
  overlay = true,
  title,
  subtitle,
  height = "100vh",
}: HeroWallpaperProps) {
  const [detectedType, setDetectedType] = useState<"image" | "video">("image");

  useEffect(() => {
    if (mediaType === "auto") {
      // Auto-detect media type from file extension
      const extension = mediaUrl.split(".").pop()?.toLowerCase();
      if (["mp4", "webm", "ogg", "mov"].includes(extension || "")) {
        setDetectedType("video");
      } else {
        setDetectedType("image");
      }
    } else {
      setDetectedType(mediaType);
    }
  }, [mediaUrl, mediaType]);

  const finalType = mediaType === "auto" ? detectedType : mediaType;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height }}
    >
      {/* Media Background */}
      {finalType === "video" ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={mediaUrl}
          alt="Hero wallpaper"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
      )}

      {/* Gradient Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
      )}

      {/* Content Overlay */}
      {(title || subtitle) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {title && (
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-lg md:text-2xl text-white/90 max-w-2xl drop-shadow-md">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/70 rounded-full" />
        </div>
      </div>
    </div>
  );
}
