import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Wand2, Shield, Users, ArrowRight, ChevronDown, ChevronUp, Star } from "lucide-react";
import logo from "../assets/logo.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const roomSamples = [
    {
      title: "Japandi Living Room",
      img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80",
      desc: "Calm, clean lines combined with warm natural textures.",
    },
    {
      title: "Luxury Modern Bedroom",
      img: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80",
      desc: "Warm brass accents, custom lighting, and premium bedding.",
    },
    {
      title: "Tropical Coastal Dining",
      img: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=600&q=80",
      desc: "Airy spaces with cane furniture and marine stone highlights.",
    },
  ];

  const valueProps = [
    {
      icon: <Wand2 size={24} className="prop-icon" />,
      title: "Instant AI Designs",
      desc: "Upload a picture of any room, choose a style, and get high-definition visualizations in seconds.",
    },
    {
      icon: <Users size={24} className="prop-icon" />,
      title: "Expert Consultations",
      desc: "Connect via Live Video call with top-rated Indian interior designers for personalized consultations.",
    },
    {
      icon: <Shield size={24} className="prop-icon" />,
      title: "Vetted Professionals",
      desc: "Every consultant is manually approved by our admin panel to ensure premium service quality.",
    },
  ];

  const designStyles = [
    {
      name: "Heritage Rajasthani",
      accent: "#d4af37",
      desc: "Vibrant ethnic colors, handcarved jali panels, and royal arches blending royal Jaipur aesthetics.",
      tags: ["Ornate", "Teakwood", "Traditional"],
    },
    {
      name: "Minimalist Japandi",
      accent: "#8b7e74",
      desc: "Sleek bamboo frames, low-profile tatami beds, and warm neutral linens expressing absolute serenity.",
      tags: ["Calm", "Natural", "Organic"],
    },
    {
      name: "Coastal Kerala",
      accent: "#4a7c59",
      desc: "Woven rattan chairs, open ventilation patterns, and local oxide floors perfect for tropical light.",
      tags: ["Airy", "Terracotta", "Classic"],
    },
    {
      name: "Bohemian Chic",
      accent: "#c08a3e",
      desc: "Textured macrame tapestries, floor poufs, and lush indoor planters for a cozy, artistic feel.",
      tags: ["Cozy", "Plush", "Artistic"],
    },
    {
      name: "Scandinavian Hygge",
      accent: "#7f8c8d",
      desc: "Plush wool carpets, burning hearth vibes, light oak sideboards, and candle-lit layouts emphasizing winter warmth.",
      tags: ["Warm", "Soft", "Nordic"],
    },
    {
      name: "Industrial Loft",
      accent: "#34495e",
      desc: "Exposed brick murals, matte black iron beams, distressed leather sofas, and suspended Edison bulbs for a raw urban edge.",
      tags: ["Raw", "Metal", "Modern"],
    },
    {
      name: "Art Deco Glamour",
      accent: "#9b59b6",
      desc: "Gleaming velvet fabrics, geometric gold trims, large vanity mirrors, and bold black marble finishes for rich retro indulgence.",
      tags: ["Glossy", "Bold", "Retro"],
    },
    {
      name: "Contemporary Eclectic",
      accent: "#e67e22",
      desc: "Whimsical color block walls, asymmetric display shelving, mixed eras furniture, and bold pop art statements celebrating individuality.",
      tags: ["Vibrant", "Modern", "Unique"],
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Snap & Upload",
      desc: "Take a picture of your living room, bedroom, or kitchen using our web interface or mobile app.",
    },
    {
      num: "02",
      title: "Choose Style & Render",
      desc: "Select from our curated list of 10+ design styles. Watch our AI create HD renders in under 10 seconds.",
    },
    {
      num: "03",
      title: "Schedule Expert Video Call",
      desc: "Instantly schedule a 1-on-1 virtual design session with a top certified designer to refine layout blueprints.",
    },
  ];

  const testimonials = [
    {
      name: "Aarav Mehta",
      role: "Homeowner, Mumbai",
      text: "The AI render gave me a perfect layout, and my call with Priya Sharma finalized all furniture materials. Saved me thousands in architect commissions!",
      rating: 5,
    },
    {
      name: "Sneha Reddy",
      role: "Appartment Owner, Bangalore",
      text: "Booking a consultant was exceptionally easy. The Video call and shared notes made it a breeze to explain my requirements. Highly recommended!",
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: "How does the AI room generation work?",
      a: "Our advanced AI uses diffusion models trained on high-end interior spaces. By analyzing your uploaded room structures, it creates new stylistic renders while maintaining accurate dimensions.",
    },
    {
      q: "What happens during a consultation session?",
      a: "You join a secure, browser-native 1-on-1 video call with a vetted consultant. Together, you review your AI designs, discuss layout modifications, finalize budgets, and establish procurement steps.",
    },
    
  ];

  return (
    <div className="landing-container animate-fade-in">
      {/* Navigation */}
      <nav className="landing-nav glass-card">
        <div className="nav-logo">
          <img src={logo} alt="MyDesignGhar Logo" style={{ height: "32px", objectFit: "contain", marginRight: "4px" }} />
          <span>MyDesignGhar</span>
        </div>
        <div className="nav-links">
          <Link to="/consultant/login" className="nav-item">Consultant Portal</Link>
          <Link to="/consultant/signup" className="nav-item">Become a Consultant</Link>
          <button
            onClick={() => {
              const pw = window.prompt("Enter administrative access key:");
              if (pw === "1234567890") {
                navigate("/admin");
              } else if (pw !== null) {
                alert("Invalid access key. Access denied.");
              }
            }}
            className="nav-item admin-link"
            style={{
              background: "rgba(205, 162, 80, 0.1)",
              border: "1px solid rgba(205, 162, 80, 0.2)",
              cursor: "pointer",
              fontFamily: "inherit",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            Admin Panel
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-glow-back" />
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} /> AI-POWERED INTERIOR ARCHITECTURE
          </div>
          <h1>Redesign Your Home In Seconds</h1>
          <p>
            Upload a photo of your space, instantly render 3D-like custom styles with AI, and schedule secure 1-on-1 video consults with certified interior experts.
          </p>
          <div className="hero-actions">
            <Link to="/consultant/signup" className="btn btn-primary">
              Register as Designer <ArrowRight size={16} />
            </Link>
            <Link to="/consultant/login" className="btn btn-secondary">
              Consultant Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Value Propositions */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose MyDesignGhar?</h2>
          <p>Crafting professional interior design solutions for modern Indian households.</p>
        </div>
        <div className="props-grid">
          {valueProps.map((prop, i) => (
            <div key={i} className="prop-card glass-card">
              <div className="prop-icon-wrapper">{prop.icon}</div>
              <h3>{prop.title}</h3>
              <p>{prop.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Style Explorer Section */}
      <section className="styles-section">
        <div className="section-header">
          <h2>Curated Design Styles</h2>
          <p>Explore different design philosophies crafted to match your taste.</p>
        </div>
        <div className="styles-grid">
          {designStyles.map((style, i) => (
            <div key={i} className="style-card glass-card" style={{ borderTop: `4px solid ${style.accent}` }}>
              <h3>{style.name}</h3>
              <p>{style.desc}</p>
              <div className="style-tags">
                {style.tags.map((t, idx) => (
                  <span key={idx} className="style-tag">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Go from a blank canvas to a professionally styled home in 3 simple steps.</p>
        </div>
        <div className="steps-container">
          {steps.map((step, i) => (
            <div key={i} className="step-row">
              <div className="step-num-box">{step.num}</div>
              <div className="step-info">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Design Showcase */}
      <section className="showcase-section">
        <div className="section-header">
          <h2>AI Design Inspirations</h2>
          <p>Instantly generated design schemas for various room configurations.</p>
        </div>
        <div className="showcase-grid">
          {roomSamples.map((sample, i) => (
            <div key={i} className="showcase-card glass-card">
              <div className="showcase-img-wrapper">
                <img src={sample.img} alt={sample.title} />
              </div>
              <div className="showcase-info">
                <h3>{sample.title}</h3>
                <p>{sample.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>Client Success Stories</h2>
          <p>What our clients have to say about the virtual consultation process.</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card glass-card">
              <div className="stars-row">
                {[...Array(t.rating)].map((_, idx) => (
                  <Star key={idx} size={16} fill="var(--primary)" color="var(--primary)" />
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about our platform and services.</p>
        </div>
        <div className="faq-accordion">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div key={i} className="faq-item glass-card" onClick={() => setActiveFaq(isOpen ? null : i)}>
                <div className="faq-question">
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {isOpen && <div className="faq-answer">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Mobile App Call-to-action */}
      <section className="app-cta-section glass-card">
        <div className="app-cta-content">
          <h2>Transform Your Spaces On The Go</h2>
          <p>Download our mobile app to instantly snap photos of your rooms, generate renders, and join consultation video calls directly from your phone.</p>
          <div className="app-badges">
            <a href="#" className="badge-btn">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play Store" />
            </a>
            {/* <a href="#" className="badge-btn">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" />
            </a> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={logo} alt="MyDesignGhar Logo" style={{ height: "24px", objectFit: "contain", marginRight: "4px" }} />
            <span>MyDesignGhar</span>
          </div>
          <p>&copy; {new Date().getFullYear()} MyDesignGhar. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .landing-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 0 20px;
          background-image: var(--bg-gradient);
        }

        .landing-nav {
          max-width: 1200px;
          width: 100%;
          margin: 20px auto 0 auto;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 20px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--text);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-item {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          transition: color 0.2s ease;
        }
        .nav-item:hover {
          color: var(--primary);
        }

        .admin-link {
          background: rgba(205, 162, 80, 0.1);
          color: var(--primary);
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(205, 162, 80, 0.2);
        }
        .admin-link:hover {
          background: rgba(205, 162, 80, 0.2);
          color: var(--primary-hover);
        }

        .hero-section {
          max-width: 1000px;
          width: 100%;
          margin: 100px auto;
          text-align: center;
          position: relative;
          padding: 40px 20px;
        }

        .hero-glow-back {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(205, 162, 80, 0.08) 0%, rgba(0, 0, 0, 0) 70%);
          z-index: -1;
          pointer-events: none;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid var(--border);
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--primary);
          margin-bottom: 24px;
        }

        .hero-section h1 {
          font-size: 56px;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -1.5px;
          color: var(--text);
          margin-bottom: 20px;
          background: linear-gradient(135deg, #1b1e24 30%, #b88f3e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-section p {
          font-size: 18px;
          line-height: 1.6;
          color: var(--text-muted);
          max-width: 700px;
          margin: 0 auto 40px auto;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .features-section, .styles-section, .how-it-works-section, .showcase-section, .testimonials-section, .faq-section {
          max-width: 1200px;
          width: 100%;
          margin: 60px auto;
          padding: 0 20px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .section-header h2 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .section-header p {
          color: var(--text-muted);
          font-size: 16px;
        }

        .props-grid, .styles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .prop-card, .style-card {
          padding: 32px;
          text-align: left;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .prop-card:hover, .style-card:hover {
          transform: translateY(-5px);
          border-color: rgba(205, 162, 80, 0.3);
        }

        .prop-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(205, 162, 80, 0.08);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .prop-card h3, .style-card h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .prop-card p, .style-card p {
          color: var(--text-muted);
          line-height: 1.5;
          font-size: 14px;
        }

        .style-tags {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .style-tag {
          font-size: 11px;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid var(--border);
          padding: 4px 8px;
          border-radius: 6px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .step-row {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 24px;
          background: var(--card);
          border: 1px solid var(--card-border);
          border-radius: 16px;
        }

        .step-num-box {
          font-size: 32px;
          font-weight: 900;
          color: var(--primary);
          background: rgba(205, 162, 80, 0.08);
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-info h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .step-info p {
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.5;
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .showcase-card {
          overflow: hidden;
          transition: transform 0.2s ease;
        }
        .showcase-card:hover {
          transform: translateY(-5px);
        }

        .showcase-img-wrapper {
          height: 240px;
          overflow: hidden;
        }

        .showcase-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .showcase-card:hover .showcase-img-wrapper img {
          transform: scale(1.05);
        }

        .showcase-info {
          padding: 24px;
        }

        .showcase-info h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .showcase-info p {
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.5;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .testimonial-card {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .stars-row {
          display: flex;
          gap: 4px;
        }

        .testimonial-text {
          font-size: 14px;
          line-height: 1.6;
          font-style: italic;
          color: var(--text);
        }

        .testimonial-author {
          display: flex;
          flex-direction: column;
          font-size: 13px;
        }

        .testimonial-author strong {
          color: var(--text);
        }

        .testimonial-author span {
          color: var(--text-muted);
        }

        .faq-accordion {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .faq-item {
          padding: 20px 24px;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }
        .faq-item:hover {
          border-color: rgba(205, 162, 80, 0.2);
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          font-size: 16px;
        }

        .faq-answer {
          margin-top: 14px;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-muted);
          border-top: 1px solid var(--border);
          padding-top: 14px;
        }

        .app-cta-section {
          max-width: 1160px;
          width: 100%;
          margin: 80px auto;
          padding: 60px 40px;
          text-align: center;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(24df, 240, 240, 0.8) 100%);
          position: relative;
          overflow: hidden;
        }

        .app-cta-content {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .app-cta-content h2 {
          font-size: 36px;
          font-weight: 800;
        }

        .app-cta-content p {
          color: var(--text-muted);
          font-size: 16px;
          line-height: 1.6;
        }

        .app-badges {
          display: flex;
          gap: 16px;
          margin-top: 12px;
        }

        .badge-btn img {
          height: 48px;
          transition: transform 0.2s ease;
        }
        .badge-btn:hover img {
          transform: translateY(-2px);
        }

        .landing-footer {
          margin-top: auto;
          border-top: 1px solid var(--border);
          padding: 40px 0;
          width: 100%;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-muted);
          font-size: 14px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: var(--text);
        }

        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 40px;
          }
          .landing-nav {
            padding: 16px;
          }
          .nav-links {
            gap: 12px;
          }
          .hero-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .footer-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
          .app-badges {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
