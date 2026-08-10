import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface StylePreset {
  id: string;
  name: string;
  tagline: string;
}

const stylePresets: StylePreset[] = [
  { id: 'modern', name: 'Modern Minimalist', tagline: 'Clean lines, sleek quartz & natural wood' },
  { id: 'scandinavian', name: 'Scandinavian Warmth', tagline: 'Soft textures, cozy beige & light oak' },
  { id: 'industrial', name: 'Industrial Chic', tagline: 'Exposed brick, dark metal & ambient filament' },
  { id: 'classic', name: 'Luxury Classic', tagline: 'Ornate molding, marble & velvet accents' },
];

export default function BeforeAfter() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeStyle, setActiveStyle] = useState<string>('modern');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;

    if (percentage < 0) {
      percentage = 0;
    }

    if (percentage > 100) {
      percentage = 100;
    }

    setSliderPosition(percentage);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    handleMove(event.clientX);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || event.touches.length === 0) {
      return;
    }

    handleMove(event.touches[0].clientX);
  };

  const stopAutoplay = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (hasInteracted || isDragging) {
      return;
    }

    let frameId = 0;
    const startTime = Date.now();

    const loop = () => {
      const time = (Date.now() - startTime) / 1000;
      const position = 50 + Math.sin(time * 1.5) * 18;
      setSliderPosition(position);
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [hasInteracted, isDragging]);

  const currentPreset = stylePresets.find((s) => s.id === activeStyle) ?? stylePresets[0];

  return (
    <section className="ai-section" id="ai-styling">
      <div className="ai-bg-glow ai-glow-1" aria-hidden="true" />
      <div className="ai-bg-glow ai-glow-2" aria-hidden="true" />

      <div className="ai-container">
        <div className="ai-header-wrapper reveal-item">
          <div className="ai-engine-pill">
            <Sparkles size={15} className="ai-sparkle-icon" />
            <span>MYDESIGNGHAR AI ENGINE</span>
            <span className="ai-live-dot" />
          </div>
          <div className="ai-subtitle-text">AI ROOM GENERATION</div>
          <h2 className="ai-main-title">
            Design Your Space <span className="title-gradient">Instantly</span>
          </h2>
          <p className="ai-main-desc">
            Transform raw, empty rooms into photorealistic, high-fidelity styled spaces in seconds using advanced spatial AI.
          </p>
        </div>

        <div className="ai-style-bar reveal-item">
          <span className="ai-style-label">
            <Sliders size={16} /> Select AI Style Preset:
          </span>
          <div className="ai-style-tabs">
            {stylePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`ai-style-tab ${activeStyle === preset.id ? 'active' : ''}`}
                onClick={() => {
                  stopAutoplay();
                  setActiveStyle(preset.id);
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="ai-grid">
          <div className="ai-content reveal-item">
            <div className="ai-active-style-banner">
              <div className="style-banner-badge">Active Theme</div>
              <h3 className="style-banner-title">{currentPreset.name}</h3>
              <p className="style-banner-desc">{currentPreset.tagline}</p>
            </div>

            <div className="ai-features-list">
              <div className="ai-feature-card">
                <div className="ai-feature-icon-wrapper blue">
                  <Sparkles size={22} />
                </div>
                <div className="ai-feature-text">
                  <div className="ai-feature-header">
                    <h4 className="ai-feature-title">Photorealistic Renders</h4>
                    <span className="ai-metric-pill">4K Ultra HD</span>
                  </div>
                  <p className="ai-feature-desc">
                    High-fidelity renders customized to your room layout, lighting conditions, and architectural boundaries.
                  </p>
                </div>
              </div>

              <div className="ai-feature-card">
                <div className="ai-feature-icon-wrapper orange">
                  <Layers size={22} />
                </div>
                <div className="ai-feature-text">
                  <div className="ai-feature-header">
                    <h4 className="ai-feature-title">Multiple Style Selection</h4>
                    <span className="ai-metric-pill orange">25+ Styles</span>
                  </div>
                  <p className="ai-feature-desc">
                    Switch between modern, classic, Scandinavian, or industrial styles instantly with 1-click previewing.
                  </p>
                </div>
              </div>

              <div className="ai-feature-card">
                <div className="ai-feature-icon-wrapper purple">
                  <Cpu size={22} />
                </div>
                <div className="ai-feature-text">
                  <div className="ai-feature-header">
                    <h4 className="ai-feature-title">Spatial AI Intelligence</h4>
                    <span className="ai-metric-pill purple">&lt; 2s Generation</span>
                  </div>
                  <p className="ai-feature-desc">
                    Smart neural positioning places furniture, materials, and lighting automatically tuned for modern Indian homes.
                  </p>
                </div>
              </div>
            </div>

            <div className="ai-cta-row">
              <a href="#quote" className="ai-cta-btn">
                <span>Try AI Generator Now</span>
                <ArrowRight size={18} />
              </a>
              <div className="ai-guarantee">
                <CheckCircle2 size={16} /> <span>100% Instant Visualizations</span>
              </div>
            </div>
          </div>

          <div className="ai-viewer-wrapper reveal-item">
            <div
              className="ba-slider-container"
              ref={containerRef}
              onMouseDown={(event) => {
                event.preventDefault();
                stopAutoplay();
                setIsDragging(true);
              }}
              onTouchStart={() => {
                stopAutoplay();
                setIsDragging(true);
              }}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseEnter={stopAutoplay}
            >
              <img src="/images/project-living.png" alt="Styled Living Room" className="ba-image ba-before" />

              <div
                className="ba-image ba-after"
                style={{
                  backgroundImage: 'url(/images/empty-room.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                }}
              />

              <div
                className="ba-slider-bar"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="ba-slider-handle">
                  <Sliders size={18} className="handle-icon" />
                </div>
              </div>

              <span className="ba-label before-label">Before (Raw Space)</span>
              <span className="ba-label after-label">After (AI Styled)</span>

              <div className="ba-render-badge">
                <div className="render-badge-dot" />
                <div className="render-badge-info">
                  <span className="render-badge-title">Styled Living Room</span>
                  <span className="render-badge-sub">Render Time: 1.2s • 4K AI output</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
