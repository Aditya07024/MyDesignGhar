import { useEffect, useState } from 'react';
import { INDIA_INTERIOR_FALLBACK_IMAGES } from '../../data/indiaInteriors';

interface StateImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIndex?: number;
  loading?: 'eager' | 'lazy';
  draggable?: boolean;
}

export default function StateImage({
  src,
  alt,
  className,
  fallbackIndex = 0,
  loading = 'lazy',
  draggable = false,
}: StateImageProps) {
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      draggable={draggable}
      onError={() => {
        const fallback = INDIA_INTERIOR_FALLBACK_IMAGES[fallbackIndex % INDIA_INTERIOR_FALLBACK_IMAGES.length];
        if (imageSrc !== fallback) {
          setImageSrc(fallback);
        }
      }}
    />
  );
}
