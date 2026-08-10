import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Building2,
  Home,
  Trophy,
  Users,
} from 'lucide-react';
import Navbar from './Navbar';
import type { HeroProps, PartialStats, StatKey, Stats } from '../types';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  duration?: number;
}

interface HeroStatItem {
  key: StatKey;
  icon: LucideIcon;
  label: string;
  value: number;
  suffix: string;
}

const defaultStats: Stats = {
  years: { value: 15, suffix: '+', label: 'Years of creating spaces' },
  projects: { value: 90, suffix: '+', label: 'Amazing projects brought to life' },
  clients: { value: 75, suffix: '+', label: 'Happy clients, happy spaces' },
  awards: { value: 11, suffix: '', label: 'Designs that earn awards' },
};

function mergeStats(stats?: PartialStats): Stats {
  return {
    years: { ...defaultStats.years, ...stats?.years },
    projects: { ...defaultStats.projects, ...stats?.projects },
    clients: { ...defaultStats.clients, ...stats?.clients },
    awards: { ...defaultStats.awards, ...stats?.awards },
  };
}

function AnimatedNumber({ value, suffix = '', duration = 1500 }: AnimatedNumberProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasStarted) {
        setHasStarted(true);
      }
    }, { threshold: 0.1 });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    let start = 0;
    const end = value;

    if (start === end) {
      setCount(end);
      return;
    }

    const incrementTime = Math.max(Math.floor(duration / end), 15);
    const timer = window.setInterval(() => {
      start += 1;
      setCount(start);

      if (start >= end) {
        setCount(end);
        window.clearInterval(timer);
      }
    }, incrementTime);

    return () => window.clearInterval(timer);
  }, [duration, hasStarted, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Hero({ stats }: HeroProps) {
  const currentStats = mergeStats(stats);

  const statItems: HeroStatItem[] = [
    { key: 'years', icon: Home, label: currentStats.years.label, value: currentStats.years.value, suffix: currentStats.years.suffix },
    { key: 'projects', icon: Building2, label: currentStats.projects.label, value: currentStats.projects.value, suffix: currentStats.projects.suffix },
    { key: 'clients', icon: Users, label: currentStats.clients.label, value: currentStats.clients.value, suffix: currentStats.clients.suffix },
    { key: 'awards', icon: Trophy, label: currentStats.awards.label, value: currentStats.awards.value, suffix: currentStats.awards.suffix },
  ];

  return (
    <section className="hero" id="home">
      <div className="hero-shell-bg">
        <Navbar />

        {/* <div className="hero-brand-reveal" aria-hidden="true">
          <h1>MY DESIGN GHAR</h1>
        </div> */}

        <div className="hero-interactive-stage">
          <div className="hero-left-cta-box">
            <a href="#quote" className="hero-cta-link">
              <button className="hero-cta">
                <p>Start Your Project</p>
                <span className="chevron-box">
                  <ArrowRight size={16} strokeWidth={2.5} />
                </span>
              </button>
            </a>
          </div>
        </div>

        <div className="hero-stats-panel">
          {statItems.map(({ key, icon: Icon, label, value, suffix }) => (
            <div className="hero-stat-card" key={key}>
              <div className="hero-stat-icon">
                <Icon size={26} strokeWidth={1.8} />
              </div>
              <div className="hero-stat-text">
                <div className="stat-number">
                  <AnimatedNumber value={value} suffix={suffix} />
                </div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
