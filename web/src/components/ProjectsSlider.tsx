import { useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import type { ProjectsSliderProps } from '../types';

const categories = ['All', 'Living Room', 'Kitchen', 'Bedroom', 'Office'];

export default function ProjectsSlider({
  projects,
  currentSlide,
  setCurrentSlide,
  progressWidth,
  handlePrevSlide,
  handleNextSlide,
}: ProjectsSliderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setCurrentSlide(0);
    } else {
      const firstIndex = projects.findIndex(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
      if (firstIndex !== -1) {
        setCurrentSlide(firstIndex);
      }
    }
  };

  return (
    <section className="slideshow-section" id="projects">
      {/* Background ambient glow orbs matching hero styling */}
      <div className="projects-bg-glow projects-glow-1" aria-hidden="true" />
      <div className="projects-bg-glow projects-glow-2" aria-hidden="true" />

      <div className="projects-shell">
        {/* Section Header */}
        <div className="projects-header-wrapper reveal-item">
          <div className="projects-badge-pill">
            <Trophy size={15} className="projects-trophy-icon" />
            <span>CURATED PORTFOLIO</span>
            <span className="projects-live-dot" />
          </div>
          <div className="projects-subtitle-text">OUR PAST WORK</div>
          <h2 className="projects-main-title">
            Portraying Luxury &amp; <span className="title-gradient">Craftsmanship</span>
          </h2>
          <p className="projects-main-desc">
            Explore our collection of award-winning interior transformations — meticulously crafted to redefine modern living.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="projects-filter-bar reveal-item">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`projects-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Slider Container Stage */}
        <div className="slider-container reveal-item">
          {/* Top animated progress bar */}
          <div className="slider-progress" style={{ width: `${progressWidth}%` }} />

          {projects.map((project, index) => {
            const isSlideActive = index === currentSlide;
            return (
              <div
                key={project.id}
                className={`slide ${isSlideActive ? 'active' : ''}`}
              >
                {/* Background Image Stage */}
                <div className="slide-image-container">
                  <img src={project.image} alt={project.title} className="slide-image" />
                </div>

                {/* Floating Glass Content Card */}
                <div className="slide-content">
                  <div className="slide-header-tags anim-stagger-1">
                    <span className="slide-cat-badge">{project.category}</span>
                    <span className="slide-counter-badge">
                      0{index + 1} / 0{projects.length}
                    </span>
                  </div>

                  <h3 className="slide-title anim-stagger-2">{project.title}</h3>
                  <p className="slide-desc anim-stagger-3">{project.description}</p>

                  {/* Spec Grid */}
                  <div className="slide-details-grid anim-stagger-5">
                    <div className="slide-spec-box">
                      <div className="slide-detail-label">Location</div>
                      <div className="slide-detail-val">
                        {project.details.location || 'India'}
                      </div>
                    </div>
                    <div className="slide-spec-box">
                      <div className="slide-detail-label">Area Size</div>
                      <div className="slide-detail-val">{project.details.area}</div>
                    </div>
                  </div>

                  {/* Action Link */}
                  <a href="#quote" className="slide-cta-link anim-stagger-5">
                    <span>Book Similar Design</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            );
          })}

          {/* Navigation Controls */}
          <div className="slider-nav">
            <button className="slider-btn" onClick={handlePrevSlide} aria-label="Previous Project">
              <ChevronLeft size={20} />
            </button>

            <div className="slider-dots">
              {projects.map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button className="slider-btn" onClick={handleNextSlide} aria-label="Next Project">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

