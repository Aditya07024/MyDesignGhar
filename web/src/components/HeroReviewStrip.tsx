import { Star, ShieldCheck, Trophy, CheckCircle2, TrendingUp, Zap, Award } from 'lucide-react';

interface StripDataItem {
  id: string;
  type: 'review' | 'award' | 'stat' | 'feature' | 'trending';
  icon: any;
  iconColor: string;
  badge: string;
  title: string;
  text: string;
}

const stripDataItems: StripDataItem[] = [
  {
    id: '1',
    type: 'review',
    icon: Star,
    iconColor: '#fbbf24',
    badge: 'CLIENT REVIEW',
    title: 'Aarav Mehta (Gurugram)',
    text: '"Final home feels calm, ultra-premium & practical for family use. 5/5 Stars!"',
  },
  {
    id: '2',
    type: 'award',
    icon: Trophy,
    iconColor: '#f59e0b',
    badge: 'AWARD WINNER',
    title: 'Design Excellence 2025',
    text: 'Voted #1 Luxury Interior Studio for Residential Architecture',
  },
  {
    id: '3',
    type: 'stat',
    icon: CheckCircle2,
    iconColor: '#34d399',
    badge: 'LIVE METRIC',
    title: '99.4% On-Time Completion',
    text: '500+ Premium Spaces Handed Over Without Delays',
  },
  {
    id: '4',
    type: 'feature',
    icon: Zap,
    iconColor: '#60a5fa',
    badge: 'AI TECH',
    title: 'Spatial Rendering AI',
    text: 'Generate photorealistic 3D room styling in under 60 seconds',
  },
  {
    id: '5',
    type: 'review',
    icon: Star,
    iconColor: '#fbbf24',
    badge: 'CLIENT REVIEW',
    title: 'Isha Rao (Bengaluru)',
    text: '"Visual planning made decisions easy! Saw exact lighting & storage flow before execution."',
  },
  {
    id: '6',
    type: 'trending',
    icon: TrendingUp,
    iconColor: '#a7f3d0',
    badge: 'TRENDING NOW',
    title: 'Japandi & Warm Quartz',
    text: 'Oak Handleless Cabinets & Ambient Backlighting trending in 2026',
  },
  {
    id: '7',
    type: 'stat',
    icon: Award,
    iconColor: '#fbbf24',
    badge: 'TOP RATED',
    title: '4.9 / 5.0 Rating',
    text: 'Verified by over 250+ satisfied homeowners across India',
  },
  {
    id: '8',
    type: 'review',
    icon: Star,
    iconColor: '#fbbf24',
    badge: 'CLIENT REVIEW',
    title: 'Rohan Kapoor (Mumbai)',
    text: '"Polished process from consultation to handover. Master suite looks straight out of a magazine."',
  },
];

export default function HeroReviewStrip() {
  const marqueeItems = [...stripDataItems, ...stripDataItems, ...stripDataItems];

  return (
    <section className="hero-reviews-ticker-strip" id="hero-reviews">
      <div className="ticker-strip-wrapper">
        {/* Left Fixed Badge Label */}
        <div className="ticker-label-badge">
          <ShieldCheck size={13} className="ticker-icon-check" />
          <span>HIGHLIGHTS</span>
          <div className="ticker-live-dot" />
        </div>

        {/* 35px Height Multi-Data Marquee Ticker */}
        <div className="ticker-marquee-track-container">
          <div className="ticker-marquee-track">
            {marqueeItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div className="ticker-item-inline" key={`${item.id}-${idx}`}>
                  <span className="ticker-data-badge">
                    <Icon size={11} style={{ color: item.iconColor }} />
                    <span>{item.badge}</span>
                  </span>
                  <strong className="ticker-data-title">{item.title}</strong>
                  <span className="ticker-data-text">{item.text}</span>
                  <span className="ticker-separator">•</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Fixed Score Summary */}
        {/* <div className="ticker-score-badge">
          <div className="ticker-score-stars">
            <Star size={11} fill="currentColor" />
          </div>
          <strong>4.9/5.0 Rating</strong>
        </div> */}
      </div>
    </section>
  );
}
