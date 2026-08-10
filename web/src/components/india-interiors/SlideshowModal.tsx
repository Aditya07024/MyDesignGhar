import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { TouchEvent } from 'react';
import type { IndiaInteriorState } from '../../types';
import StateImage from './StateImage';

interface SlideshowModalProps {
  state: IndiaInteriorState;
  slideIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSelect: (index: number) => void;
}

export default function SlideshowModal({
  state,
  slideIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  onSelect,
}: SlideshowModalProps) {
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'ArrowRight') {
        onNext();
      }

      if (event.key === 'ArrowLeft') {
        onPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious]);

  if (!isOpen) {
    return null;
  }

  const currentImage = state.images[slideIndex];

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchEndX - touchStartX.current;

    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        onNext();
      } else {
        onPrevious();
      }
    }

    touchStartX.current = null;
  };

  return (
    <div className="india-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="india-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="india-modal-title"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="india-modal-header">
          <div>
            <span className="india-modal-kicker">Interior Atlas</span>
            <h3 id="india-modal-title">{state.name}</h3>
            <p>{state.description}</p>
          </div>
          <button type="button" className="india-modal-close" onClick={onClose} aria-label="Close slideshow">
            <X size={20} />
          </button>
        </div>

        <div className="india-modal-stage">
          <button type="button" className="india-modal-nav prev" onClick={onPrevious} aria-label="Previous image">
            <ChevronLeft size={22} />
          </button>

          <div className="india-modal-image-frame">
            <StateImage
              src={currentImage}
              alt={`${state.name} interior slide ${slideIndex + 1}`}
              className="india-modal-image"
              fallbackIndex={slideIndex}
              loading="eager"
            />
          </div>

          <button type="button" className="india-modal-nav next" onClick={onNext} aria-label="Next image">
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="india-modal-footer">
          <div className="india-modal-dots" aria-label="Slideshow pagination">
            {state.images.map((image, index) => (
              <button
                key={`${state.id}-${image}-dot`}
                type="button"
                className={`india-modal-dot${index === slideIndex ? ' active' : ''}`}
                onClick={() => onSelect(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
          <span className="india-modal-count">{slideIndex + 1} / {state.images.length}</span>
        </div>
      </div>
    </div>
  );
}
