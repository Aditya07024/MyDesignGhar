import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Mail,
  Palette,
  Phone,
  RotateCcw,
  Sparkles,
  Upload,
  User,
  Wand2,
  X,
} from 'lucide-react';
import type { QuoteFormProps } from '../types';

const designStyles = [
  { id: 'traditional', name: 'Traditional Indian', tagline: 'Jali work, teak wood & rich heritage motifs' },
  { id: 'modern', name: 'Modern Minimalist', tagline: 'Clean lines, handleless cabinetry & quartz' },
  { id: 'scandinavian', name: 'Scandinavian Warmth', tagline: 'Light oak, cozy beige & soft ambient lighting' },
  { id: 'industrial', name: 'Industrial Chic', tagline: 'Exposed brick, dark steel & filament warmth' },
  { id: 'luxury', name: 'Luxury Classic', tagline: 'Marble flooring, brass trims & velvet accent' },
];

const budgetRanges = [
  '₹2 Lakhs - ₹5 Lakhs',
  '₹5 Lakhs - ₹10 Lakhs',
  '₹10 Lakhs - ₹20 Lakhs',
  '₹20 Lakhs+ (Bespoke)',
];

export interface StateOption {
  id: string;
  name: string;
  cue: string;
  region: 'North' | 'South' | 'West' | 'East & Central' | 'North-East & Islands';
}

const stateDesignOptions: StateOption[] = [
  // North India
  { id: 'delhi', name: 'Delhi NCR', cue: 'Contemporary classic finishes & urban luxury', region: 'North' },
  { id: 'rajasthan', name: 'Rajasthan', cue: 'Warm arches, stone & carved wood', region: 'North' },
  { id: 'punjab', name: 'Punjab', cue: 'Bold arches, handcrafted wood & warm hospitality', region: 'North' },
  { id: 'haryana', name: 'Haryana', cue: 'Structured plans & muted modern elegance', region: 'North' },
  { id: 'himachal-pradesh', name: 'Himachal Pradesh', cue: 'Timber frames, stone character & hearths', region: 'North' },
  { id: 'jammu-kashmir', name: 'Jammu & Kashmir', cue: 'Walnut wood, carpet textiles & carved details', region: 'North' },
  { id: 'ladakh', name: 'Ladakh', cue: 'Mountain calm, stone tones & minimal timber', region: 'North' },
  { id: 'uttarakhand', name: 'Uttarakhand', cue: 'Natural light, tactile wood & quiet retreat', region: 'North' },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh', cue: 'Grand rooms, carved mouldings & symmetry', region: 'North' },
  { id: 'chandigarh', name: 'Chandigarh', cue: 'Modern lines, polished surfaces & orderly layouts', region: 'North' },

  // South India
  { id: 'kerala', name: 'Kerala', cue: 'Natural timber, tropical courtyards & calm greens', region: 'South' },
  { id: 'karnataka', name: 'Karnataka', cue: 'Modern wood, verandahs & clean storage', region: 'South' },
  { id: 'tamil-nadu', name: 'Tamil Nadu', cue: 'Chettinad columns & stately timber furniture', region: 'South' },
  { id: 'telangana', name: 'Telangana', cue: 'Contemporary calm, warm tones & craft accents', region: 'South' },
  { id: 'andhra-pradesh', name: 'Andhra Pradesh', cue: 'Soft luxury, warm finishes & regional craft', region: 'South' },
  { id: 'puducherry', name: 'Puducherry', cue: 'Coastal calm, French colonial & sunlit rooms', region: 'South' },
  { id: 'lakshadweep', name: 'Lakshadweep', cue: 'Coastal luxury, woven textures & sea air', region: 'South' },

  // West India & UTs
  { id: 'maharashtra', name: 'Maharashtra', cue: 'Urban luxury, wada timber depth & efficient layouts', region: 'West' },
  { id: 'goa', name: 'Goa', cue: 'Airy coastal, Indo-Portuguese tiles & relaxed textures', region: 'West' },
  { id: 'gujarat', name: 'Gujarat', cue: 'Courtyard pol houses, carved facades & rich textiles', region: 'West' },
  { id: 'dadra-nagar-haveli-daman-diu', name: 'Dadra & Nagar Haveli and Daman & Diu', cue: 'Coastal light, craft detail & relaxed rooms', region: 'West' },

  // East & Central India
  { id: 'west-bengal', name: 'West Bengal', cue: 'Colonial proportion, decorative details & layered light', region: 'East & Central' },
  { id: 'bihar', name: 'Bihar', cue: 'Earthy palette, warm timber & crafted furniture', region: 'East & Central' },
  { id: 'jharkhand', name: 'Jharkhand', cue: 'Natural materials, grounded palette & solid joinery', region: 'East & Central' },
  { id: 'odisha', name: 'Odisha', cue: 'Temple geometry, artisan craft & textured rooms', region: 'East & Central' },
  { id: 'madhya-pradesh', name: 'Madhya Pradesh', cue: 'Grounded materials, layered wood & heritage cues', region: 'East & Central' },
  { id: 'chhattisgarh', name: 'Chhattisgarh', cue: 'Natural palette, quiet detailing & generous plans', region: 'East & Central' },

  // North-East & Islands
  { id: 'assam', name: 'Assam', cue: 'Bamboo craft, cane details & natural light', region: 'North-East & Islands' },
  { id: 'arunachal-pradesh', name: 'Arunachal Pradesh', cue: 'Local craft, warm timber & mountain calm', region: 'North-East & Islands' },
  { id: 'meghalaya', name: 'Meghalaya', cue: 'Atmospheric wood, handcrafted scale & soft warmth', region: 'North-East & Islands' },
  { id: 'sikkim', name: 'Sikkim', cue: 'Mountain calm, soft textures & craft focus', region: 'North-East & Islands' },
  { id: 'nagaland', name: 'Nagaland', cue: 'Tribal craft, woven textiles & dark wood', region: 'North-East & Islands' },
  { id: 'manipur', name: 'Manipur', cue: 'Local woods, layered textiles & calm elegance', region: 'North-East & Islands' },
  { id: 'mizoram', name: 'Mizoram', cue: 'Woven surfaces, timber warmth & compact comfort', region: 'North-East & Islands' },
  { id: 'tripura', name: 'Tripura', cue: 'Handcrafted spirit, warm palette & intimate rooms', region: 'North-East & Islands' },
  { id: 'andaman-nicobar', name: 'Andaman & Nicobar Islands', cue: 'Ocean light, resort calm & relaxed sophistication', region: 'North-East & Islands' },
];



export default function QuoteForm({
  formData,
  handleInputChange,
  handleFormSubmit,
  isSubmitting,
}: QuoteFormProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('Traditional Indian');
  const [selectedBudget, setSelectedBudget] = useState<string>('₹5 Lakhs - ₹10 Lakhs');
  const [selectedState, setSelectedState] = useState<string>('Rajasthan');
  const [stateSearchQuery, setStateSearchQuery] = useState<string>('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('All');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatePickerModalOpen, setIsStatePickerModalOpen] = useState(false);
  const [isStep2Expanded, setIsStep2Expanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStepText, setGenerationStepText] = useState('');
  const [isSuccessState, setIsSuccessState] = useState(false);

  const filteredStates = stateDesignOptions.filter((st) => {
    const matchesRegion = selectedRegionFilter === 'All' || st.region === selectedRegionFilter;
    const matchesSearch = st.name.toLowerCase().includes(stateSearchQuery.toLowerCase()) ||
                          st.cue.toLowerCase().includes(stateSearchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerSubmission = (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const fullPayload = {
      ...formData,
      style: selectedStyle,
      budget: selectedBudget,
      statePreference: selectedState,
      service: 'AI Room Styling (Waitlist)',
      imageUrl: uploadedImage || undefined,
    };
    // Call handleFormSubmit with updated payload
    if (handleFormSubmit) {
      const dummyEvent = {
        preventDefault: () => {},
        target: {} as any,
      } as any;
      void handleFormSubmit(dummyEvent, fullPayload);
    }
  };

  const handleGenerateClick = () => {
    if (!formData.email || !formData.phone || !formData.name) {
      setIsModalOpen(true);
    } else {
      triggerSubmission();
      startGenerationFlow();
    }
  };

  const startGenerationFlow = () => {
    setIsModalOpen(false);
    setIsGenerating(true);
    setGenerationProgress(15);
    setGenerationStepText('Logging room specifications & spatial request...');

    setTimeout(() => {
      setGenerationProgress(50);
      setGenerationStepText(`Configuring ${selectedStyle} design profile...`);
    }, 1000);

    setTimeout(() => {
      setGenerationProgress(85);
      setGenerationStepText('Registering priority access & saving specifications...');
    }, 2000);

    setTimeout(() => {
      setGenerationProgress(100);
      setIsGenerating(false);
      setIsSuccessState(true);
    }, 3000);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSubmission(e);
    startGenerationFlow();
  };

  const resetFormState = () => {
    setIsSuccessState(false);
    setIsGenerating(false);
    setIsStep2Expanded(false);
    setUploadedImage(null);
  };

  return (
    <section className="quote-section" id="quote">
      {/* Background ambient glow orbs */}
      <div className="quote-bg-glow quote-glow-1" aria-hidden="true" />
      <div className="quote-bg-glow quote-glow-2" aria-hidden="true" />

      <div className="quote-shell">
        {/* Premium Section Header Banner */}
        <div className="quote-header-hero-wrapper reveal-item">
          <div className="quote-badge-row">
            <div className="quote-badge-pill">
              <Sparkles size={14} className="sparkle-icon" />
              <span>GET IN TOUCH</span>
              <span className="quote-live-dot" />
            </div>
            <span className="quote-category-tag">INTERACTIVE AI DESIGN LAB</span>
          </div>

          <h2 className="quote-hero-title">
            Let&apos;s Create Something <span className="quote-gradient-text">Extraordinary</span>
          </h2>

          <div className="quote-gradient-accent-line" aria-hidden="true" />

          {/* <div className="quote-description-glass-pill">
            <p>
              Whether you have a complete blueprints breakdown or just a vision of your next project, our team is ready to design a home that feels uniquely yours.
            </p>
          </div> */}

          <div className="quote-header-spec-pills">
            <span className="spec-pill">⚡ Instant AI 3D Blueprints</span>
            <span className="spec-pill">💬 1-on-1 Senior Architect Session</span>
            <span className="spec-pill">🏡 Tailored Materials &amp; Cost Breakdown</span>
          </div>
        </div>

        {/* Full-Width AI Studio Form Container */}
        <div className="quote-studio-container full-width reveal-item">
          <div className="quote-studio-card">
            <div className="studio-card-header">
              <div className="studio-header-title">
                <Sparkles size={20} className="studio-sparkle" />
                <h3>AI Design &amp; Consultation Generator</h3>
              </div>
              <span className="studio-header-tag">Instant Visualizer</span>
            </div>

            {/* Success Result View */}
            {isSuccessState ? (
              <div className="ai-success-view">
                <div className="success-badge-wrapper">
                  <div className="success-aura-ring" />
                  <div className="success-badge-icon">
                    <CheckCircle2 size={42} />
                  </div>
                </div>

                <div className="success-title-pill">
                  <Sparkles size={14} className="sparkle-pulse" />
                  <span>VIP PRIORITY REGISTERED</span>
                  <span className="live-waitlist-dot" />
                </div>

                <h3 className="success-heading">
                  AI Space Generator — Feature Coming Soon! 🚀
                </h3>
                
                <p className="success-subtext">
                  Thank you <strong>{formData.name || 'valued user'}</strong>! Our Instant 3D AI Room Generation feature is under active development and will be launching soon.
                </p>

                <div className="success-summary-grid">
                  <div className="summary-grid-card access-card">
                    <div className="summary-card-icon">✨</div>
                    <div className="summary-card-content">
                      <span className="summary-card-label">Priority Access</span>
                      <strong className="summary-card-value badge-orange">Registered on Early Waitlist</strong>
                    </div>
                  </div>

                  <div className="summary-grid-card style-card">
                    <div className="summary-card-icon">🎨</div>
                    <div className="summary-card-content">
                      <span className="summary-card-label">Saved Room Style</span>
                      <strong className="summary-card-value">{selectedStyle}</strong>
                    </div>
                  </div>

                  <div className="summary-grid-card budget-card">
                    <div className="summary-card-icon">💎</div>
                    <div className="summary-card-content">
                      <span className="summary-card-label">Budget Range</span>
                      <strong className="summary-card-value">{selectedBudget}</strong>
                    </div>
                  </div>

                  <div className="summary-grid-card state-card">
                    <div className="summary-card-icon">📍</div>
                    <div className="summary-card-content">
                      <span className="summary-card-label">Regional Design Direction</span>
                      <strong className="summary-card-value">{selectedState}</strong>
                    </div>
                  </div>

                  <div className="summary-grid-card contact-card">
                    <div className="summary-card-icon">📱</div>
                    <div className="summary-card-content">
                      <span className="summary-card-label">Notification Contact</span>
                      <strong className="summary-card-value">{formData.phone || formData.email || 'Contact Details Saved'}</strong>
                    </div>
                  </div>
                </div>

                <div className="vip-database-banner">
                  <span className="vip-shield-icon">🛡️</span>
                  <p>
                    We have saved your room preferences in our database so our team can grant you early <strong>VIP Access</strong> as soon as this feature goes live!
                  </p>
                </div>

                <button type="button" className="reset-gen-btn glow-cta-btn" onClick={resetFormState}>
                  <RotateCcw size={18} className="rotate-icon" />
                  <span>Submit Another Preference</span>
                </button>
              </div>
            ) : isGenerating ? (
              /* Generation Progress View */
              <div className="ai-generating-view">
                <div className="gen-loader-spinner">
                  <Wand2 size={32} className="spinning-wand" />
                </div>
                <h3>Generating Your AI Space Visualization</h3>
                <p className="gen-step-text">{generationStepText}</p>
                <div className="gen-progress-bar-track">
                  <div className="gen-progress-bar-fill" style={{ width: `${generationProgress}%` }} />
                </div>
                <span className="gen-percentage">{generationProgress}% Completed</span>
              </div>
            ) : (
              /* Step Form View (2-Stage Flow) */
              <div className="studio-form-steps">
                {/* Stage 1: Initial 2 Inputs on Landing Page */}
                <div className="studio-steps-stage1">
                  <div className="studio-steps-2col">
                    {/* Input 1: Upload Image or Camera */}
                    <div className="studio-step-block">
                      <label className="step-block-label">
                        <span className="block-num">1</span>
                        <span>Upload Room Photo or Take Picture</span>
                      </label>

                      {uploadedImage ? (
                        <div className="image-preview-container compact">
                          <img src={uploadedImage} alt="Uploaded Room" className="uploaded-preview-img" />
                          <button
                            type="button"
                            className="remove-img-btn"
                            onClick={() => setUploadedImage(null)}
                            title="Remove Image"
                          >
                            <X size={16} />
                          </button>
                          <span className="image-loaded-tag">
                            <CheckCircle2 size={14} /> Photo Ready
                          </span>
                        </div>
                      ) : (
                        <div className="upload-options-wrapper">
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            ref={cameraInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                          />

                          <div className="dropzone-box compact">
                            <div className="dropzone-actions">
                              <button
                                type="button"
                                className="upload-action-btn primary"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload size={16} />
                                <span>Upload Image</span>
                              </button>
                              <button
                                type="button"
                                className="upload-action-btn secondary"
                                onClick={() => cameraInputRef.current?.click()}
                              >
                                <Camera size={16} />
                                <span>Camera</span>
                              </button>
                            </div>
                            <span className="dropzone-hint">JPG, PNG, WEBP • Max 15MB</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input 2: Custom AI Prompt & Vision */}
                    <div className="studio-step-block">
                      <label className="step-block-label">
                        <span className="block-num">2</span>
                        <span>Custom AI Prompt &amp; Room Vision</span>
                      </label>

                      <div className="prompt-input-wrapper">
                        <textarea
                          name="customPrompt"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          className="studio-prompt-textarea compact"
                          placeholder="e.g. Add a warm teak wood study nook, brass lights &amp; indoor plants..."
                          rows={2}
                        />

                        <div className="prompt-suggestions">
                          <span className="prompt-sug-label">Ideas:</span>
                          {['Warm Teak & Marble', 'Biophilic Greenery', 'Ambient Backlight', 'Modular Kitchen'].map((idea) => (
                            <button
                              key={idea}
                              type="button"
                              className="prompt-chip-btn"
                              onClick={() => setCustomPrompt((prev) => (prev ? `${prev}, ${idea}` : idea))}
                            >
                              + {idea}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage 1 Action Button: Click to Open Remaining 3 Inputs */}
                {!isStep2Expanded && (
                  <div className="studio-submit-block">
                    <button
                      type="button"
                      className="generate-ai-btn"
                      onClick={() => setIsStep2Expanded(true)}
                    >
                      <Wand2 size={20} />
                      <span>Generate AI Design &amp; Configure Renders</span>
                    </button>
                    <span className="submit-subtext">Click to customize design style, budget &amp; regional state preference</span>
                  </div>
                )}

                {/* Stage 2 (Expanded View): Remaining 3 Inputs + Final Submit */}
                {isStep2Expanded && (
                  <div className="studio-steps-stage2 anim-fade-in">
                    <div className="studio-steps-2col margin-top-space">
                      <div className="studio-col">
                        {/* Input 3: Select Design Style */}
                        <div className="studio-step-block">
                          <label className="step-block-label">
                            <span className="block-num">3</span>
                            <span>Select Design Style &amp; Mood</span>
                          </label>

                          <div className="design-styles-grid compact">
                            {designStyles.map((style) => (
                              <button
                                key={style.id}
                                type="button"
                                className={`style-card-btn compact ${selectedStyle === style.name ? 'active' : ''}`}
                                onClick={() => setSelectedStyle(style.name)}
                              >
                                <div className="style-card-header">
                                  <Palette size={15} className="style-card-icon" />
                                  <span className="style-name">{style.name}</span>
                                </div>
                                <span className="style-tagline">{style.tagline}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="studio-col">
                        {/* Input 4: Estimated Investment */}
                        <div className="studio-step-block">
                          <label className="step-block-label">
                            <span className="block-num">4</span>
                            <span>Estimated Investment &amp; Scope</span>
                          </label>

                          <div className="budget-pills-row compact">
                            {budgetRanges.map((budget) => (
                              <button
                                key={budget}
                                type="button"
                                className={`budget-pill-btn compact ${selectedBudget === budget ? 'active' : ''}`}
                                onClick={() => setSelectedBudget(budget)}
                              >
                                {budget}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Input 5: Choose Regional Design Direction */}
                        <div className="studio-step-block">
                          <label className="step-block-label">
                            <span className="block-num">5</span>
                            <span>Choose Regional Design Direction</span>
                          </label>

                          <button
                            type="button"
                            className="state-picker-trigger-btn"
                            onClick={() => setIsStatePickerModalOpen(true)}
                          >
                            <div className="state-trigger-info">
                              <MapPin size={18} className="state-trigger-pin" />
                              <div className="state-trigger-labels">
                                <span className="state-trigger-sub">Selected Regional Mood:</span>
                                <strong className="state-trigger-title">{selectedState}</strong>
                              </div>
                            </div>

                            <div className="state-trigger-action">
                              <span>Choose State / UT ({stateDesignOptions.length} Regions)</span>
                              <ChevronDown size={16} />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Final Submit Action Button */}
                    <div className="studio-submit-block">
                      <button
                        type="button"
                        className="generate-ai-btn final-submit-btn"
                        onClick={handleGenerateClick}
                        disabled={isSubmitting}
                      >
                        <Wand2 size={20} />
                        <span>Submit AI Design Request &amp; Get Consultation</span>
                      </button>
                      <span className="submit-subtext">Free 1-on-1 Certified Architect Consultation Included</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Dual Contact Pills Bar */}
        <div className="quote-contact-pills-row reveal-item">
          <a href="tel:+919876543210" className="contact-pill-link">
            <div className="contact-pill-icon">
              <Phone size={18} />
            </div>
            <div className="contact-pill-text">
              <span className="pill-title">CALL US</span>
              <span className="pill-val">+91 98765 43210</span>
            </div>
          </a>

          <a href="mailto:consult@mydesignghar.com" className="contact-pill-link">
            <div className="contact-pill-icon orange">
              <Mail size={18} />
            </div>
            <div className="contact-pill-text">
              <span className="pill-title">EMAIL US</span>
              <span className="pill-val">consult@mydesignghar.com</span>
            </div>
          </a>
        </div>
      </div>

      {/* Contact Details Lead Modal */}
      {isModalOpen && (
        <div className="lead-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="lead-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Sparkles size={20} className="modal-sparkle" />
                <h3>Enter Contact Details to Unlock Render</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <p className="modal-desc">
              Provide your email address and phone number so our senior architects can send your high-definition 4K renderings &amp; material estimate breakdown.
            </p>

            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="modal-form-group">
                <label className="modal-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="modal-input"
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="modal-input"
                    placeholder="e.g. rahul@example.com"
                    required
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Phone Number (WhatsApp)</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="modal-input"
                    placeholder="e.g. +91 99887 76655"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="modal-submit-btn">
                <Wand2 size={18} />
                <span>Confirm &amp; Generate AI Render</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 36 States & UTs Picker Modal */}
      {isStatePickerModalOpen && (
        <div className="lead-modal-backdrop" onClick={() => setIsStatePickerModalOpen(false)}>
          <div className="state-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <MapPin size={20} className="modal-sparkle" />
                <h3>Choose Regional Design Direction ({stateDesignOptions.length} States &amp; UTs)</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsStatePickerModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search & Region Filter Bar */}
            <div className="state-filter-controls modal-filter-bar">
              <input
                type="text"
                placeholder="🔍 Search all 36 States & UTs (e.g. Goa, Kerala, Delhi...)"
                value={stateSearchQuery}
                onChange={(e) => setStateSearchQuery(e.target.value)}
                className="state-search-input"
                autoFocus
              />
              <div className="region-filter-tabs">
                {['All', 'North', 'South', 'West', 'East & Central', 'North-East & Islands'].map((region) => (
                  <button
                    key={region}
                    type="button"
                    className={`region-tab-btn ${selectedRegionFilter === region ? 'active' : ''}`}
                    onClick={() => setSelectedRegionFilter(region)}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Grid of 36 Regions */}
            <div className="state-design-grid compact modal-state-grid">
              {filteredStates.map((state) => (
                <button
                  key={state.id}
                  type="button"
                  className={`state-design-btn ${selectedState === state.name ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedState(state.name);
                    setIsStatePickerModalOpen(false);
                  }}
                >
                  <div className="state-design-name">
                    <MapPin size={14} />
                    <span>{state.name}</span>
                    <span className="state-region-badge">{state.region}</span>
                  </div>
                  <span className="state-design-cue">{state.cue}</span>
                </button>
              ))}
              {filteredStates.length === 0 && (
                <div className="no-state-found-msg">
                  No region found matching &quot;{stateSearchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

