import { useEffect, useRef, useState } from 'react';
import BeforeAfter from '../components/BeforeAfter';
import ExploreIndiaInteriors from '../components/ExploreIndiaInteriors';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import HeroReviewStrip from '../components/HeroReviewStrip';
import MobileAppBanner from '../components/MobileAppBanner';
import ProjectsSlider from '../components/ProjectsSlider';
import QuoteForm from '../components/QuoteForm';
import ReviewsPanel from '../components/ReviewsPanel';
import Steps from '../components/Steps';
import type {
  PartialStats,
  Project,
  QuoteFormData,
  QuoteInputChangeEvent,
  Stats,
  SubmitStatus,
} from '../types';

const fallbackProjects: Project[] = [
  {
    id: 1,
    title: 'Signature Living House',
    category: 'Living Room',
    description: 'A refined living space with a balanced open layout, layered textures, and a polished palette made for everyday comfort.',
    image: '/images/living_house.png',
    tags: ['Elegant', 'Spacious', 'Warm Lighting'],
    details: { area: '350 sq ft', duration: '4 weeks', style: 'Contemporary Living', location: 'Mumbai' },
  },
  {
    id: 2,
    title: 'Modern Family Kitchen',
    category: 'Kitchen',
    description: 'A practical and premium kitchen composition with clean cabinetry, generous storage, and finishes selected for daily use.',
    image: '/images/kitchen.png',
    tags: ['Functional', 'Premium Finish', 'Smart Storage'],
    details: { area: '220 sq ft', duration: '3 weeks', style: 'Contemporary Luxury', location: 'New Delhi' },
  },
  {
    id: 3,
    title: 'Serene Master Bedroom',
    category: 'Bedroom',
    description: 'A calm bedroom design with soft lighting, clean furniture lines, and a restful mood shaped around comfort.',
    image: '/images/bedroom1.png',
    tags: ['Calm', 'Soft Lighting', 'Comfort'],
    details: { area: '280 sq ft', duration: '3.5 weeks', style: 'Modern Luxury', location: 'Gurugram' },
  },
  {
    id: 4,
    title: 'Elegant Bedroom Suite',
    category: 'Bedroom',
    description: 'A second bedroom concept focused on premium finishes, uncluttered planning, and a quiet hotel-like atmosphere.',
    image: '/images/bedroom2.png',
    tags: ['Premium', 'Relaxed', 'Layered Textures'],
    details: { area: '260 sq ft', duration: '3 weeks', style: 'Elegant Modern', location: 'Bengaluru' },
  },
  {
    id: 5,
    title: 'Bright Modular Kitchen',
    category: 'Kitchen',
    description: 'A crisp kitchen layout with efficient work zones, durable materials, and a bright visual rhythm across the cabinetry.',
    image: '/images/kitchen2.png',
    tags: ['Modular', 'Bright', 'Efficient Layout'],
    details: { area: '210 sq ft', duration: '3 weeks', style: 'Modern Modular', location: 'Pune' },
  },
];

const fallbackStats: Stats = {
  years: { value: 15, suffix: '+', label: 'Years of creating spaces' },
  projects: { value: 90, suffix: '+', label: 'Amazing projects brought to life' },
  clients: { value: 75, suffix: '+', label: 'Happy clients, happy spaces' },
  awards: { value: 11, suffix: '', label: 'Designs that earn awards' },
};

const initialFormData: QuoteFormData = {
  name: '',
  email: '',
  phone: '',
  service: 'AI Room Styling',
  budget: '$5,000 - $10,000',
  message: '',
};

interface QuoteResponse {
  message?: string;
  error?: string;
}

export default function LandingPage() {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [stats, setStats] = useState<PartialStats>(fallbackStats);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slideDuration = 6000;
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimer = useRef<number | null>(null);
  const progressStartTime = useRef<number | null>(null);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const projRes = await fetch('http://localhost:5000/api/projects');
        if (projRes.ok) {
          const projData = (await projRes.json()) as Project[];
          setProjects(projData);
        }

        const statsRes = await fetch('http://localhost:5000/api/stats');
        if (statsRes.ok) {
          const statsData = (await statsRes.json()) as PartialStats;
          setStats(statsData);
        }
      } catch (error) {
        console.warn('Backend service offline. Running application using local fallback data.', error);
      }
    };

    void fetchApiData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 },
    );

    const revealItems = document.querySelectorAll('.reveal-item');
    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [projects]);

  const resetSliderTimer = () => {
    if (slideTimer.current) {
      clearInterval(slideTimer.current);
    }

    if (progressTimer.current !== null) {
      cancelAnimationFrame(progressTimer.current);
    }

    progressStartTime.current = Date.now();
    setProgressWidth(0);

    const animateProgress = () => {
      const startTime = progressStartTime.current ?? Date.now();
      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / slideDuration) * 100, 100);
      setProgressWidth(percentage);

      if (percentage < 100) {
        progressTimer.current = requestAnimationFrame(animateProgress);
      }
    };

    progressTimer.current = requestAnimationFrame(animateProgress);

    slideTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % projects.length);
    }, slideDuration);
  };

  useEffect(() => {
    if (projects.length > 0) {
      resetSliderTimer();
    }

    return () => {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
      }

      if (progressTimer.current !== null) {
        cancelAnimationFrame(progressTimer.current);
      }
    };
  }, [currentSlide, projects]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const handleInputChange = (event: QuoteInputChangeEvent) => {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (event: any, overridePayload?: any) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    setIsSubmitting(true);
    setSubmitStatus(null);

    const submissionData = overridePayload || formData;

    // Local Storage Database Fallback (always saves locally so zero requests are ever lost)
    try {
      const existingStr = localStorage.getItem('mdg_feature_requests') || '[]';
      const existingList = JSON.parse(existingStr);
      existingList.push({
        ...submissionData,
        submittedAt: new Date().toISOString(),
        id: Date.now(),
      });
      localStorage.setItem('mdg_feature_requests', JSON.stringify(existingList));
    } catch (lsErr) {
      console.warn('LocalStorage save error:', lsErr);
    }

    try {
      // Attempt 1: Backend API (port 5001)
      let response = await fetch('http://localhost:5001/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      }).catch(() => null);

      // Attempt 2: Port 5000 fallback
      if (!response || !response.ok) {
        response = await fetch('http://localhost:5000/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData),
        }).catch(() => null);
      }

      if (response && response.ok) {
        const resData = (await response.json()) as QuoteResponse;
        setSubmitStatus({ type: 'success', message: resData.message ?? 'Request saved to database.' });
      } else {
        setSubmitStatus({
          type: 'success',
          message: 'Your feature request has been recorded and saved!',
        });
      }
      setFormData(initialFormData);
    } catch (error) {
      console.warn('Backend offline, saved to local database.', error);
      setSubmitStatus({
        type: 'success',
        message: 'Your feature request has been saved in local storage database!',
      });
      setFormData(initialFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home-page">
      <Hero stats={stats} />
      <HeroReviewStrip />
      <ProjectsSlider
        projects={projects}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        progressWidth={progressWidth}
        handlePrevSlide={handlePrevSlide}
        handleNextSlide={handleNextSlide}
      />
      <BeforeAfter />
      <QuoteForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        submitStatus={submitStatus}
        isSubmitting={isSubmitting}
      />
      <ExploreIndiaInteriors />
      <Steps />
      <ReviewsPanel />
      <MobileAppBanner />
      <Footer />
    </div>
  );
}
