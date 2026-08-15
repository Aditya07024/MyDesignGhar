import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, MouseEvent, TouchEvent } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  Image as ImageIcon,
  MapPin,
  Palette,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  Upload,
  Wand2,
  X,
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

const budgetRanges = ['$2,000 - $5,000', '$5,000 - $10,000', '$10,000 - $25,000', '$25,000+'];

const stateDesignOptions = [
  { name: 'Maharashtra', subtitle: 'Konkan Coastal & Modern Vernacular' },
  { name: 'Delhi NCR', subtitle: 'Lutyens Luxury & Neo-Contemporary' },
  { name: 'Karnataka', subtitle: 'Deccan Wooden Craft & Courtyard Warmth' },
  { name: 'Tamil Nadu', subtitle: 'Chettinad Carved Pillars & Terracotta' },
  { name: 'Telangana', subtitle: 'Royal Nizami Elegance & Sleek Marble' },
  { name: 'Gujarat', subtitle: 'Jali Lattice & Vibrant Earthy Tones' },
  { name: 'Rajasthan', subtitle: 'Jodhpur Blue & Heritage Archways' },
  { name: 'Kerala', subtitle: 'Slanted Teak Gables & Biophilic Rain Lawns' },
  { name: 'West Bengal', subtitle: 'Colonial High-Ceiling & Art-Deco Brass' },
  { name: 'Punjab & Haryana', subtitle: 'Grand Volume & Warm Polished Granite' },
];

export default function BeforeAfter() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Input States
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Validation States
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState('');

  // Configuration Modal States
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('Modern Minimalist');
  const [selectedBudget, setSelectedBudget] = useState('$5,000 - $10,000');
  const [selectedState, setSelectedState] = useState('Maharashtra (Konkan Coastal & Modern Vernacular)');
  const [isStatePickerOpen, setIsStatePickerOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  // Generation & Success States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStepText, setGenerationStepText] = useState('Initializing spatial AI...');
  const [isSuccess, setIsSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const ideaPresets = [
    'Warm Teak & Marble',
    'Biophilic Greenery',
    'Ambient Backlight',
    'Modular Kitchen',
  ];

  const handleIdeaClick = (idea: string) => {
    setCustomPrompt((prev) => {
      const updated = prev ? `${prev}, ${idea}` : idea;
      if (updated.trim()) {
        setShowValidationError(false);
      }
      return updated;
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
      setShowValidationError(false);
    }
  };

  const handleOpenConfigModal = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const isPhotoFilled = Boolean(selectedFileName);
    const isPromptFilled = Boolean(customPrompt.trim());

    if (!isPhotoFilled || !isPromptFilled) {
      setShowValidationError(true);
      if (!isPhotoFilled && !isPromptFilled) {
        setValidationErrorMessage('Please upload a room photo and enter your room vision prompt first!');
      } else if (!isPhotoFilled) {
        setValidationErrorMessage('Please upload a room photo or take a picture (Input 1) first!');
      } else {
        setValidationErrorMessage('Please enter your custom AI prompt & room vision (Input 2) first!');
      }
      return;
    }

    setShowValidationError(false);
    setValidationErrorMessage('');
    setIsConfigModalOpen(true);
  };

  const handleFinalSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsConfigModalOpen(false);
    setIsGenerating(true);
    setGenerationProgress(0);

    // Record submission
    try {
      const existingStr = localStorage.getItem('mdg_feature_requests') || '[]';
      const existingList = JSON.parse(existingStr);
      existingList.push({
        fileName: selectedFileName,
        customPrompt,
        selectedStyle,
        selectedBudget,
        selectedState,
        contactName,
        contactInfo,
        submittedAt: new Date().toISOString(),
        id: Date.now(),
      });
      localStorage.setItem('mdg_feature_requests', JSON.stringify(existingList));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    const steps = [
      { p: 20, text: 'Analyzing uploaded room geometry & layout...' },
      { p: 45, text: 'Applying neural materials & spatial furniture mapping...' },
      { p: 75, text: 'Rendering 4K photorealistic lighting & ambient shadows...' },
      { p: 95, text: 'Finalizing high-fidelity spatial composition...' },
      { p: 100, text: 'Visualization Complete!' },
    ];

    let stepIdx = 0;
    const timer = setInterval(() => {
      if (stepIdx < steps.length) {
        setGenerationProgress(steps[stepIdx].p);
        setGenerationStepText(steps[stepIdx].text);
        stepIdx++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setIsGenerating(false);
          setIsSuccess(true);
        }, 400);
      }
    }, 600);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setIsGenerating(false);
    setGenerationProgress(0);
    setSelectedFileName(null);
    setCustomPrompt('');
    setContactName('');
    setContactInfo('');
    setShowValidationError(false);
  };

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (isDragging) handleMove(event.clientX);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (isDragging && event.touches.length > 0) handleMove(event.touches[0].clientX);
  };

  const stopAutoplay = () => {
    if (!hasInteracted) setHasInteracted(true);
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
    if (hasInteracted || isDragging) return;
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

  return (
    <section className="ai-section" id="ai-styling">
      <div id="quote" />
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

        <div className="ai-grid">
          {/* Left Column: Generator / Loader / Success Card */}
          <div className="ai-generator-card reveal-item">
            {isSuccess ? (
              /* Success View */
              <div className="ai-success-view">
                <div className="success-badge-wrapper">
                  <div className="success-badge-icon">
                    <CheckCircle2 size={42} />
                  </div>
                </div>

                <div className="success-title-pill">
                  <Sparkles size={14} />
                  <span>VIP PRIORITY REGISTERED</span>
                </div>

                <h3 className="success-heading">AI Space Render Configured! 🚀</h3>
                <p className="success-subtext">
                  Thank you <strong>{contactName || 'Valued Client'}</strong>! Your AI 3D room visualization and consultation request have been saved to our database.
                </p>

                <div className="success-summary-grid">
                  <div className="summary-grid-card">
                    <span className="summary-card-label">Photo</span>
                    <strong className="summary-card-value">{selectedFileName || 'Uploaded'}</strong>
                  </div>
                  <div className="summary-grid-card">
                    <span className="summary-card-label">Style</span>
                    <strong className="summary-card-value">{selectedStyle}</strong>
                  </div>
                  <div className="summary-grid-card">
                    <span className="summary-card-label">Investment</span>
                    <strong className="summary-card-value">{selectedBudget}</strong>
                  </div>
                  <div className="summary-grid-card">
                    <span className="summary-card-label">Region</span>
                    <strong className="summary-card-value">{selectedState}</strong>
                  </div>
                </div>

                <button type="button" className="ai-upload-btn primary" onClick={handleReset} style={{ width: '100%', marginTop: '12px' }}>
                  <RotateCcw size={16} />
                  <span>Submit Another Preference</span>
                </button>
              </div>
            ) : isGenerating ? (
              /* Generating Loader View */
              <div className="ai-generating-view" style={{ padding: '24px 12px', textAlign: 'center' }}>
                <div className="gen-loader-spinner" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <Wand2 size={36} style={{ color: '#5c2828' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Generating Your AI Space Visualization</h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '16px' }}>{generationStepText}</p>
                <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '10px', width: '100%', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ background: 'linear-gradient(90deg, #5c2828, #ef4444)', height: '100%', width: `${generationProgress}%`, transition: 'width 0.4s ease' }} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#5c2828' }}>{generationProgress}% Completed</span>
              </div>
            ) : (
              /* Step 1 & 2 Main Card Form */
              <>
                <div className="ai-gen-header">
                  <div className="ai-gen-title-group">
                    <h3 className="ai-gen-main-title">AI Design &amp; Consultation Generator</h3>
                    <span className="ai-gen-badge">
                      <Sparkles size={13} /> Instant Visualizer
                    </span>
                  </div>
                </div>

                {/* Input 1: Upload Image or Camera */}
                <div className={`ai-gen-step-block ${showValidationError && !selectedFileName ? 'has-error' : ''}`}>
                  <div className="ai-step-header">
                    <span className="ai-step-number">1</span>
                    <span className="ai-step-title">Upload Room Photo or Take Picture</span>
                  </div>

                  <div className="ai-upload-row">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: 'none' }}
                    />
                    <input
                      type="file"
                      ref={cameraInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                    />

                    <button
                      type="button"
                      className="ai-upload-btn primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} />
                      <span>Upload Image</span>
                    </button>

                    <button
                      type="button"
                      className="ai-upload-btn secondary"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera size={16} />
                      <span>Camera</span>
                    </button>
                  </div>

                  {selectedFileName ? (
                    <div className="ai-file-selected-info">
                      <ImageIcon size={14} /> <span>{selectedFileName}</span>
                    </div>
                  ) : (
                    <div className="ai-file-format-note">
                      JPG, PNG, WEBP • Max 15MB
                    </div>
                  )}
                </div>

                {/* Input 2: Custom AI Prompt */}
                <div className={`ai-gen-step-block ${showValidationError && !customPrompt.trim() ? 'has-error' : ''}`}>
                  <div className="ai-step-header">
                    <span className="ai-step-number">2</span>
                    <span className="ai-step-title">Custom AI Prompt &amp; Room Vision</span>
                  </div>

                  <textarea
                    className="ai-prompt-input"
                    placeholder="Describe your dream room style, materials, colors..."
                    value={customPrompt}
                    onChange={(e) => {
                      setCustomPrompt(e.target.value);
                      if (e.target.value.trim()) setShowValidationError(false);
                    }}
                    rows={2}
                  />

                  <div className="ai-ideas-group">
                    <span className="ai-ideas-label">Ideas:</span>
                    <div className="ai-ideas-chips">
                      {ideaPresets.map((idea) => (
                        <button
                          key={idea}
                          type="button"
                          className="ai-idea-chip"
                          onClick={() => handleIdeaClick(idea)}
                        >
                          <Plus size={12} /> {idea}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Validation Error Message */}
                {showValidationError && (
                  <div className="ai-validation-alert">
                    <AlertCircle size={16} />
                    <span>{validationErrorMessage}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <div className="ai-gen-action-block">
                  <button
                    type="button"
                    className="ai-gen-submit-btn"
                    onClick={handleOpenConfigModal}
                  >
                    <Wand2 size={18} />
                    <span>Generate AI Design &amp; Configure Renders</span>
                    <ArrowRight size={18} />
                  </button>
                  <p className="ai-gen-hint">
                    Click to customize design style, budget &amp; regional state preference
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Before After Interactive Slider */}
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

              <div className="ba-slider-bar" style={{ left: `${sliderPosition}%` }}>
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

      {/* Configuration Modal (Opens ONLY when both inputs 1 & 2 are filled!) */}
      {isConfigModalOpen && (
        <div className="lead-modal-backdrop" onClick={() => setIsConfigModalOpen(false)}>
          <div className="lead-modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(620px, 95vw)' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Sparkles size={20} className="modal-sparkle" />
                <h3>Configure Design &amp; Render Settings</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsConfigModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Selected Inputs Quick Summary */}
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>📷 Selected Room Photo: <span style={{ fontWeight: 500, color: '#059669' }}>{selectedFileName}</span></div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>💭 Vision Prompt: <span style={{ fontWeight: 500, color: '#475569' }}>"{customPrompt}"</span></div>
            </div>

            {/* Step 3: Select Style */}
            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={16} /> <span>Select Design Style &amp; Mood</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {stylePresets.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.name)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: selectedStyle === style.name ? '2px solid #5c2828' : '1px solid #cbd5e1',
                      background: selectedStyle === style.name ? '#fcf7f7' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: selectedStyle === style.name ? '#5c2828' : '#0f172a' }}>{style.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{style.tagline}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Budget Range */}
            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                Estimated Investment Scope
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {budgetRanges.map((budget) => (
                  <button
                    key={budget}
                    type="button"
                    onClick={() => setSelectedBudget(budget)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: selectedBudget === budget ? '2px solid #5c2828' : '1px solid #cbd5e1',
                      background: selectedBudget === budget ? '#5c2828' : '#ffffff',
                      color: selectedBudget === budget ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Regional State Preference */}
            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> <span>Regional Design Direction</span>
              </label>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsStatePickerOpen(!isStatePickerOpen)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                >
                  <span>{selectedState}</span>
                  <ChevronDown size={16} />
                </button>

                {isStatePickerOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', maxHeight: '180px', overflowY: 'auto', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', marginTop: '4px' }}>
                    {stateDesignOptions.map((st) => (
                      <div
                        key={st.name}
                        onClick={() => {
                          setSelectedState(`${st.name} (${st.subtitle})`);
                          setIsStatePickerOpen(false);
                        }}
                        style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{st.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{st.subtitle}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 6: Contact Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block' }}>Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block' }}>Phone / Email</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
              </div>
            </div>

            {/* Modal Submit Button */}
            <button
              type="button"
              className="ai-gen-submit-btn"
              onClick={handleFinalSubmit}
              style={{ width: '100%', marginTop: '6px' }}
            >
              <Wand2 size={18} />
              <span>Submit AI Design Request &amp; Start 3D Generation</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
