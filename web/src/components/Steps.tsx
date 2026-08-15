import { useState } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  FileText,
  Layers,
  Layout,
  Sparkles,
  UserCheck,
  Wand2,
} from 'lucide-react';

interface StepData {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof CalendarCheck;
  tags: string[];
  metric: string;
}

const stepsList: StepData[] = [
  {
    id: 1,
    number: '01',
    title: 'Book a virtual slot',
    subtitle: '1-on-1 Architect Consultation',
    description: 'Select a time that suits you best and schedule a 1-on-1 virtual design session with our certified architects.',
    icon: CalendarCheck,
    tags: ['1-on-1 Architect', 'Flexible Time Slots'],
    metric: 'Avg: 45 Mins',
  },
  {
    id: 2,
    number: '02',
    title: 'Consult & collaborate',
    subtitle: 'Interactive Blueprint Session',
    description: 'Share your rooms, goals, and layout requirements while editing design blueprints interactively on screen.',
    icon: Layout,
    tags: ['Interactive Canvas', 'Live Blueprints', '3D Editing'],
    metric: 'Live 3D Canvas',
  },
  {
    id: 3,
    number: '03',
    title: 'Receive digital dashboard',
    subtitle: 'Full Execution Package',
    description: 'Get a complete materials list, custom AI renderings, and step-by-step contractor execution guides.',
    icon: FileText,
    tags: ['Material BOQ Sheet', 'Contractor Guide', '4K Renders'],
    metric: '100% Ready-to-Build',
  },
];

export default function Steps() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [activeCanvasLayer, setActiveCanvasLayer] = useState(0);

  const activeStep = stepsList[activeStepIndex];

  const slots = [
    { time: 'Today • 4:30 PM', architect: 'Ar. Rajesh Sharma (Senior Lead)' },
    { time: 'Tomorrow • 11:00 AM', architect: 'Ar. Ananya Roy (Spatial AI Specialist)' },
    { time: 'Tomorrow • 6:00 PM', architect: 'Ar. Vikramaditya (Luxury Specialist)' },
  ];

  const canvasLayers = [
    { title: '3D Spatial Blueprint', desc: 'Real-time structural wall layout & furniture positioning' },
    { title: 'Material & Texture Swap', desc: 'Instant preview of teak wood, marble, quartz & brass finishes' },
    { title: 'AI Lighting Simulation', desc: 'Natural sunlight angle & ambient LED strip lighting controls' },
  ];

  const progressPercentage = Math.round(((activeStepIndex + 1) / stepsList.length) * 100);

  return (
    <section className="steps-section" id="consultation">
      {/* Background ambient glow orbs */}
      <div className="steps-bg-glow steps-glow-1" aria-hidden="true" />
      <div className="steps-bg-glow steps-glow-2" aria-hidden="true" />

      <div className="steps-shell">
        {/* Section Header */}
        <div className="steps-header-wrapper reveal-item">
          <div className="steps-badge-pill">
            <Sparkles size={14} className="steps-sparkle-icon" />
            <span>ARCHITECTURAL COLLABORATION WORKFLOW</span>
            <span className="steps-live-dot" />
          </div>
          <h2 className="steps-main-title">
            3 Steps to <span className="title-gradient">Your Dream Space</span>
          </h2>
          <p className="steps-main-desc">
            Experience a seamless, 1-on-1 virtual interior design journey — combining certified architect expertise with instant 3D AI renders.
          </p>
        </div>

        {/* Single Unified Stage Card Container */}
        <div className="steps-unified-stage reveal-item">
          {/* Top Progress Control Header */}
          <div className="stage-top-bar">
            <div className="stage-progress-info">
              <span className="progress-num">STEP 0{activeStepIndex + 1} OF 03</span>
              <div className="progress-track-mini">
                <div className="progress-fill-mini" style={{ width: `${progressPercentage}%` }} />
              </div>
              <span className="progress-pct">{progressPercentage}% Complete</span>
            </div>

            <div className="stage-nav-pills">
              {stepsList.map((step, idx) => (
                <button
                  key={step.number}
                  type="button"
                  className={`stage-nav-pill ${activeStepIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveStepIndex(idx)}
                >
                  <span className="pill-num">{step.number}</span>
                  <span className="pill-text">{step.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main 2-Column Split Body */}
          <div className="stage-body-grid">
            {/* Left Column: Interactive Vertical Step List */}
            <div className="steps-timeline-list">
              {stepsList.map((step, idx) => {
                const Icon = step.icon;
                const isActive = activeStepIndex === idx;

                return (
                  <div
                    key={step.number}
                    className={`timeline-step-row ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveStepIndex(idx)}
                  >
                    <div className="timeline-node-column">
                      <div className="timeline-node-icon">
                        <Icon size={18} />
                      </div>
                      {idx < stepsList.length - 1 && <div className="step-connector-segment" />}
                    </div>

                    <div className="timeline-step-content">
                      <div className="step-title-row">
                        <span className="step-number-tag">{step.number}</span>
                        <h3 className="step-title">{step.title}</h3>
                        <span className="step-metric-badge">{step.metric}</span>
                      </div>
                      <p className="step-desc">{step.description}</p>
                      <div className="step-tags-inline">
                        {step.tags.map((tag) => (
                          <span key={tag} className="tag-chip">
                            • {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Dynamic Interactive Stage Card */}
            <div className="steps-display-stage">
              <div className="stage-card-inner">
                <div className="stage-header">
                  <div className="stage-badge">
                    <Sparkles size={13} />
                    <span>ACTIVE STEP 0{activeStepIndex + 1} PREVIEW</span>
                  </div>
                  <span className="stage-subtitle">{activeStep.subtitle}</span>
                </div>

                <h4 className="stage-title">{activeStep.title}</h4>
                <p className="stage-desc">{activeStep.description}</p>

                {/* Dynamic Interactive Element Based on Active Step */}
                {activeStepIndex === 0 && (
                  <div className="stage-widget slot-widget">
                    <div className="widget-title">
                      <Clock size={14} /> <span>1-on-1 Virtual Consultation Schedule:</span>
                    </div>
                    <div className="widget-options-grid">
                      {slots.map((slot, idx) => (
                        <div
                          key={slot.time}
                          className={`slot-option ${selectedSlotIndex === idx ? 'active' : ''}`}
                          onClick={() => setSelectedSlotIndex(idx)}
                        >
                          <CalendarCheck size={15} className="slot-icon" />
                          <div className="slot-text-group">
                            <span className="slot-time">{slot.time}</span>
                            <span className="slot-arch">{slot.architect}</span>
                          </div>
                          {selectedSlotIndex === idx && (
                            <span className="slot-confirmed-badge">
                              <CheckCircle2 size={13} /> Reserved
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeStepIndex === 1 && (
                  <div className="stage-widget canvas-widget">
                    <div className="widget-title">
                      <Compass size={14} /> <span>Interactive Blueprint Layer Explorer:</span>
                    </div>
                    <div className="layer-tabs-row">
                      {canvasLayers.map((layer, idx) => (
                        <button
                          key={layer.title}
                          type="button"
                          className={`layer-tab-btn ${activeCanvasLayer === idx ? 'active' : ''}`}
                          onClick={() => setActiveCanvasLayer(idx)}
                        >
                          <Layers size={13} />
                          <span>{layer.title}</span>
                        </button>
                      ))}
                    </div>
                    <div className="layer-detail-box">
                      <div className="layer-detail-title">
                        <Wand2 size={14} className="icon-copper" />
                        <span>{canvasLayers[activeCanvasLayer].title}</span>
                      </div>
                      <p className="layer-detail-desc">{canvasLayers[activeCanvasLayer].desc}</p>
                    </div>
                  </div>
                )}

                {activeStepIndex === 2 && (
                  <div className="stage-widget dashboard-widget">
                    <div className="widget-title">
                      <FileText size={14} /> <span>Digital Execution Package Deliverables:</span>
                    </div>
                    <div className="widget-deliverables-list">
                      <div className="deliv-row">
                        <div className="deliv-info">
                          <CheckCircle2 size={14} className="check" />
                          <span>4K Photorealistic Render Album</span>
                        </div>
                        <span className="file-pill"><Download size={12} /> 45 MB ZIP</span>
                      </div>
                      <div className="deliv-row">
                        <div className="deliv-info">
                          <CheckCircle2 size={14} className="check" />
                          <span>Itemized Material Cost &amp; Brand Sheet</span>
                        </div>
                        <span className="file-pill"><Download size={12} /> BOQ.pdf</span>
                      </div>
                      <div className="deliv-row">
                        <div className="deliv-info">
                          <CheckCircle2 size={14} className="check" />
                          <span>Step-by-Step Contractor Execution Manual</span>
                        </div>
                        <span className="file-pill"><Download size={12} /> Guide.pdf</span>
                      </div>
                    </div>
                  </div>
                )}

                <a href="#ai-styling" className="stage-action-btn">
                  <UserCheck size={16} />
                  <span>Book Architect Slot &amp; Launch Design</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
