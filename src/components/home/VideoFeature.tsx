"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
  posterSrc?: string;
}

export function VideoFeature({
  videoId,
  title,
  posterSrc = "/images/hero.webp",
}: VideoFeatureProps) {
  const [playing, setPlaying] = useState(false);

  const watchUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${videoId}`,
    [videoId],
  );

  const embedUrl = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0`,
    [videoId],
  );

  return (
    <div className="space-y-4">
      <div
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        {playing ? (
          <iframe
            className="absolute top-0 left-0 h-full w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            <Image
              src={posterSrc}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/20" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] shadow-lg ring-4 ring-white/20 transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20">
              <Play className="ml-1 h-7 w-7 fill-white text-white md:h-9 md:w-9" />
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
