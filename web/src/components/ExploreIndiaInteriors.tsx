import { useEffect, useMemo, useRef, useState } from 'react';
import { Compass } from 'lucide-react';
import IndiaMap from './india-interiors/IndiaMap';
import SlideshowModal from './india-interiors/SlideshowModal';
import StatePreview from './india-interiors/StatePreview';
import {
  AUTO_RESUME_DELAY,
  INDIA_INTERIOR_AUTO_ORDER,
  INDIA_INTERIOR_STATE_MAP,
  INDIA_INTERIOR_STATES,
  STATE_DISPLAY_DURATION,
} from '../data/indiaInteriors';

function useReducedMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}

export default function ExploreIndiaInteriors() {
  const [activeStateId, setActiveStateId] = useState(INDIA_INTERIOR_AUTO_ORDER[0]);
  const [modalStateId, setModalStateId] = useState(INDIA_INTERIOR_AUTO_ORDER[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotionPreference();

  const activeState = useMemo(
    () => INDIA_INTERIOR_STATE_MAP[activeStateId] ?? INDIA_INTERIOR_STATES[0],
    [activeStateId],
  );

  const modalState = useMemo(
    () => INDIA_INTERIOR_STATE_MAP[modalStateId] ?? activeState,
    [activeState, modalStateId],
  );

  const clearTimers = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const scheduleAutoResume = () => {
    if (reducedMotion || isModalOpen) {
      return;
    }

    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = window.setTimeout(() => {
      setIsAutoPaused(false);
    }, AUTO_RESUME_DELAY);
  };

  useEffect(() => {
    if (reducedMotion || isModalOpen || isAutoPaused) {
      return undefined;
    }

    timerRef.current = window.setTimeout(() => {
      const currentIndex = INDIA_INTERIOR_AUTO_ORDER.indexOf(activeStateId);
      const nextIndex = (currentIndex + 1) % INDIA_INTERIOR_AUTO_ORDER.length;
      setActiveStateId(INDIA_INTERIOR_AUTO_ORDER[nextIndex]);
      setSlideIndex(0);
    }, STATE_DISPLAY_DURATION);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [activeStateId, isAutoPaused, isModalOpen, reducedMotion]);

  useEffect(() => {
    const currentImage = activeState.images[0];
    const nextStateId = INDIA_INTERIOR_AUTO_ORDER[(INDIA_INTERIOR_AUTO_ORDER.indexOf(activeState.id) + 1) % INDIA_INTERIOR_AUTO_ORDER.length];
    const nextImage = INDIA_INTERIOR_STATE_MAP[nextStateId]?.images[0];

    [currentImage, nextImage].forEach((imagePath) => {
      if (!imagePath) {
        return;
      }

      const image = new Image();
      image.src = imagePath;
    });
  }, [activeState]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    modalState.images.forEach((imagePath) => {
      if (!imagePath) {
        return;
      }

      const image = new Image();
      image.src = imagePath;
    });
  }, [isModalOpen, modalState]);

  useEffect(() => () => clearTimers(), []);

  const handleStateHover = (stateId: string) => {
    clearTimers();
    setIsAutoPaused(true);
    setActiveStateId(stateId);
    setSlideIndex(0);
  };

  const handleMapLeave = () => {
    scheduleAutoResume();
  };

  const handleOpenSlideshow = (stateId: string, startingSlide = 0) => {
    clearTimers();
    setActiveStateId(stateId);
    setModalStateId(stateId);
    setSlideIndex(startingSlide);
    setIsAutoPaused(true);
    setIsModalOpen(true);
  };

  const handleCloseSlideshow = () => {
    setIsModalOpen(false);
    scheduleAutoResume();
  };

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % modalState.images.length);
  };

  const handlePreviousSlide = () => {
    setSlideIndex((prev) => (prev - 1 + modalState.images.length) % modalState.images.length);
  };

  return (
    <>
      <section className="india-interiors-section" id="explore-india-interiors">
        {/* Ambient background glow orbs */}
        <div className="atlas-bg-glow atlas-glow-1" aria-hidden="true" />
        <div className="atlas-bg-glow atlas-glow-2" aria-hidden="true" />

        <div className="atlas-shell">
          <div className="atlas-header-wrapper reveal-item">
            <div className="atlas-badge-pill">
              <Compass size={15} className="atlas-compass-icon" />
              <span>INTERACTIVE INTERIOR ATLAS</span>
              <span className="atlas-live-dot" />
            </div>
            <div className="atlas-subtitle-text">EXPLORE INDIA&apos;S ARCHITECTURAL MOODS</div>
            <h2 className="atlas-main-title">
              Explore India&apos;s <span className="title-gradient">Interiors</span>
            </h2>
            <p className="atlas-main-desc">
              Travel through India&apos;s architectural moods, one state at a time. Hover to pause, click to open a full slideshow, and discover how local craft shapes each interior world.
            </p>
          </div>

          <div className="india-interiors-grid">
            <div className="india-map-card reveal-item">
              <div className="india-map-card-header">
                <div>
                  <span className="india-card-eyebrow">Design Model</span>
                  <h3>Architectural Map Exploration</h3>
                </div>
                <p className="india-map-timer-text">
                  States softly rotate every {Math.round(STATE_DISPLAY_DURATION / 1000)} seconds until you take control.
                </p>
              </div>

              <IndiaMap
                states={INDIA_INTERIOR_STATES}
                activeStateId={activeState.id}
                onStateHover={handleStateHover}
                onStateClick={handleOpenSlideshow}
                onMapLeave={handleMapLeave}
                reducedMotion={reducedMotion}
              />
            </div>

            <StatePreview
              key={activeState.id}
              state={activeState}
              onOpenSlideshow={(imageIndex = 0) => handleOpenSlideshow(activeState.id, imageIndex)}
            />
          </div>
        </div>
      </section>

      <SlideshowModal
        state={modalState}
        slideIndex={slideIndex}
        isOpen={isModalOpen}
        onClose={handleCloseSlideshow}
        onNext={handleNextSlide}
        onPrevious={handlePreviousSlide}
        onSelect={setSlideIndex}
      />
    </>
  );
}
