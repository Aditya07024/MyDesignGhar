import { useState } from 'react';
import { ArrowRight, Eye, MapPin, Sparkles } from 'lucide-react';
import type { IndiaInteriorState } from '../../types';
import StateImage from './StateImage';

interface StatePreviewProps {
  state: IndiaInteriorState;
  onOpenSlideshow: (imageIndex?: number) => void;
}

export default function StatePreview({ state, onOpenSlideshow }: StatePreviewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const activeImage = state.images[selectedImageIndex] ?? state.images[0];

  return (
    <article className="india-preview-card" aria-live="polite">
      {/* Header Info */}
      <div className="india-preview-header">
        <span className="india-preview-kicker">EXPLORE INDIA&apos;S INTERIORS</span>
        <div className="india-preview-state">
          <MapPin size={22} className="map-pin-accent" />
          <h3>{state.name}</h3>
          <span className="india-state-badge">Active Architectural Mood</span>
        </div>
        <p className="india-preview-description">{state.description}</p>
        <div className="india-preview-tags">
          {state.highlights.map((highlight) => (
            <span key={highlight} className="india-preview-tag">
              <Sparkles size={12} className="tag-sparkle" /> {highlight}
            </span>
          ))}
        </div>
      </div>

      {/* Single High-Resolution Featured Hero Display */}
      <div className="india-single-hero-stage">
        <button
          type="button"
          className="india-hero-image-box"
          onClick={() => onOpenSlideshow(selectedImageIndex)}
          aria-label={`Open ${state.name} full slideshow from image ${selectedImageIndex + 1}`}
        >
          <StateImage
            src={activeImage}
            alt={`${state.name} interior detail ${selectedImageIndex + 1}`}
            className="india-hero-image"
            fallbackIndex={selectedImageIndex}
            loading="eager"
          />

          {/* Vignette Overlay */}
          <div className="india-hero-overlay">
            <span className="india-hero-counter">
              <Eye size={14} /> Detail 0{selectedImageIndex + 1} of 0{state.images.length}
            </span>
            <div className="india-click-prompt">Click to Expand 4K View</div>
          </div>
        </button>

        {/* Thumbnail Selector Tabs Bar */}
        <div className="india-image-nav-tabs">
          <span className="nav-tabs-label">View Angles:</span>
          {state.images.map((_, idx) => (
            <button
              key={`${state.id}-thumb-${idx}`}
              type="button"
              className={`india-thumb-tab ${selectedImageIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedImageIndex(idx)}
            >
              <span>0{idx + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Action CTA */}
      <div className="india-preview-footer">
        <button
          type="button"
          className="india-preview-cta"
          onClick={() => onOpenSlideshow(selectedImageIndex)}
          aria-label={`Open ${state.name} interior slideshow`}
        >
          <span>View Full Slideshow ({state.images.length} HD Renders)</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </article>
  );
}

