import { CalendarCheck, FileText, Layout, Sparkles } from 'lucide-react';

const stepsData = [
  {
    number: '01',
    title: 'Book a virtual slot',
    description: 'Select a time that suits you best and schedule a 1-on-1 virtual design session with our certified architects.',
    icon: CalendarCheck,
    colorClass: 'blue',
    tags: ['1-on-1 Session', 'Flexible Slots'],
    metric: 'Avg: 45 Mins',
  },
  {
    number: '02',
    title: 'Consult & collaborate',
    description: 'Share your rooms, goals, and layout requirements while editing design blueprints interactively on screen.',
    icon: Layout,
    colorClass: 'orange',
    tags: ['Interactive Canvas', 'Live Blueprints'],
    metric: 'Live 3D Editing',
  },
  {
    number: '03',
    title: 'Receive digital dashboard',
    description: 'Get a complete materials list, custom AI renderings, and step-by-step contractor execution guides.',
    icon: FileText,
    colorClass: 'purple',
    tags: ['Material List', 'Contractor Guide'],
    metric: '100% Ready-to-Build',
  },
];

export default function Steps() {
  return (
    <section className="steps-section" id="consultation">
      {/* Ambient background glow orbs */}
      <div className="steps-bg-glow steps-glow-1" aria-hidden="true" />
      <div className="steps-bg-glow steps-glow-2" aria-hidden="true" />

      <div className="steps-shell">
        {/* Section Header */}
        <div className="steps-header-wrapper reveal-item">
          <div className="steps-badge-pill">
            <CalendarCheck size={15} className="steps-calendar-icon" />
            <span>VIRTUAL CONSULTANT DASHBOARD</span>
            <span className="steps-live-dot" />
          </div>
          <div className="steps-subtitle-text">SEAMLESS 3-STEP JOURNEY</div>
          <h2 className="steps-main-title">
            3 Simple Steps to <span className="title-gradient">Your Dream Space</span>
          </h2>
          <p className="steps-main-desc">
            Experience hassle-free virtual interior design — from initial 1-on-1 architect consultation to receiving fully actionable 4K AI blueprints.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="steps-grid">
          {stepsData.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="step-card reveal-item">
                <div className="step-card-header">
                  <div className={`step-icon-wrapper ${step.colorClass}`}>
                    <Icon size={24} />
                  </div>
                  <div className="step-number-badge">{step.number}</div>
                </div>

                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.description}</p>

                <div className="step-tags-list">
                  {step.tags.map((tag) => (
                    <span key={tag} className="step-tag-pill">
                      <Sparkles size={11} className="step-tag-sparkle" /> {tag}
                    </span>
                  ))}
                </div>

                <div className="step-card-footer">
                  <span className={`step-metric-tag ${step.colorClass}`}>{step.metric}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

