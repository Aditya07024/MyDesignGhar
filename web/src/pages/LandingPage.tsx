import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Rocket, 
  Compass, 
  ChevronDown, 
  ArrowRight, 
  Menu, 
  X, 
  Mail, 
  Sparkles,
  Users,
  Upload,
  Facebook,
  Twitter,
  Instagram
} from "lucide-react";
import logo from "../assets/logo.png";
import heroBg from "../assets/hero-bg.png";
import mobileMockup from "../assets/mobile-mockup.png";
import blueprints from "../assets/blueprints.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTenet, setActiveTenet] = useState<number | null>(0);

  const galleryImages = [
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=300&q=80"
  ];

  const categories = [
    { name: "Apartment", img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80" },
    { name: "Villa & Bungalow", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80" },
    { name: "Retail Design", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80" },
    { name: "Office Design", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80" }
  ];

  // const team = [
  //   { name: "Vikram Singh", role: "Founder & Lead Architect", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
  //   { name: "Rohan Mehta", role: "Heritage & Custom specialist", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" },
  //   { name: "Priya Sharma", role: "Luxury Modulations Expert", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" },
  //   { name: "Vikram Nair", role: "Japandi & Minimalist Designer", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80" }
  // ];

  const tenets = [
    { title: "AI-POWERED SPEED", content: "Generate high-fidelity, photorealistic 3D room renders in seconds. Visualize your dream space across multiple styles instantly before spending a single rupee." },
    { title: "VETTED DESIGN EXPERTS", content: "Collaborate with the top 5% of Indian interior design talent. Our consultants are verified experts in space optimization, lighting, and materials." },
    { title: "TRANSPARENT BLUEPRINTS", content: "Get direct lists of furniture sources, paint codes, and modular configurations with zero hidden vendor commissions. Save up to 35% compared to traditional agencies." }
  ];

  const handleAdminAccess = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const pw = window.prompt("Enter administrative access key:");
    if (pw === "1234567890") {
      navigate("/admin");
    } else if (pw !== null) {
      alert("Invalid access key. Access denied.");
    }
  };

  return (
    <div className="landing-root">
      {/* Sidebar Gallery Overlay Drawer */}
      <div className={`drawer-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
      <div className={`drawer-panel ${sidebarOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <img src={logo} alt="MydesignGhar Logo" style={{ height: "38px", objectFit: "cover", marginRight: "4px" }} />
            <div className="logo-text-stack">
              <span className="logo-top">Mydesign</span>
              <span className="logo-bottom">Ghar</span>
            </div>
          </div>
          <button className="drawer-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="drawer-content">
          <h4>Our Gallery</h4>
          <div className="drawer-grid">
            {galleryImages.map((src, i) => (
              <div key={i} className="drawer-thumb">
                <img src={src} alt={`Gallery ${i + 1}`} />
              </div>
            ))}
          </div>
          <div className="drawer-contact-info">
            <h4>Contact Info</h4>
            <p className="contact-item">
              <Mail size={16} /> mydesignghr.com
            </p>
          </div>
          <div className="drawer-links">
            <Link to="/consultant/login" className="drawer-link-btn" style={{ border: "2px solid white" }}>Consultant Portal</Link>
            <Link to="/consultant/signup" className="drawer-link-btn btn-primary">Become a Consultant</Link>
            <hr></hr>
            <button type="button" onClick={(e) => handleAdminAccess(e)} className="drawer-link-btn btn-admin">Admin Dashboard</button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-header">
        <div className="nav-container">
          <div className="nav-logo">
            <img src={logo} alt="MydesignGhar Logo" style={{ height: "38px", objectFit: "cover", marginRight: "4px" }} />
            <div className="logo-text-stack">
              <span className="logo-top">Mydesign</span>
              <span className="logo-bottom">Ghar</span>
            </div>
          </div>
          
          <ul className="nav-menu">
            <li><a href="#about">ABOUT <span className="arrow-down">▼</span></a></li>
            <li><a href="#designs">SERVICES <span className="arrow-down">▼</span></a></li>
            <li><a href="#portfolio">PORTFOLIO</a></li>
            <li><a href="#blog">BLOG</a></li>
            <li><a href="#services">GET A FREE ESTIMATE</a></li>
          </ul>

          <div className="nav-actions">
            <div className="nav-separator" />
            <button type="button" className="icon-action-btn hamburger" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-viewport">
        <div className="hero-bg-overlay" />
        <div className="hero-bg-outline-text">STUDIO</div>

        {/* Left Vertical Social Bar */}
        <div className="hero-social-bar">
          <a href="#" className="social-link">INSTAGRAM</a>
          <div className="social-divider" />
          <a href="#" className="social-link">FACEBOOK</a>
          <div className="social-divider" />
          <a href="#" className="social-link">YOUTUBE</a>
        </div>

        <div className="hero-wrapper">
          <div className="hero-text-block">
            <h1>Transform Your Home with AI & Top Designers</h1>
            <p>
              Generate photorealistic room designs in seconds and book 1-on-1 virtual consultations with India's top vetted design specialists. Redefine luxury living on your own terms.
            </p>
            <button onClick={() => setSidebarOpen(true)} className="btn-contact-hero">
              START DESIGNING
            </button>
          </div>
        </div>


      </header>

      {/* Quote Section */}
      <section className="quote-banner">
        <div className="quote-container">
          <div className="quote-text-box">
            <blockquote>
              "Our mission is to democratize premium interior design. By combining advanced AI visualization with real-time designer expertise, we make beautiful homes accessible to everyone."
            </blockquote>
          </div>
        </div>
      </section>

      {/* 5D Process Section */}
      <section className="process-section" id="about">
        <div className="landing-section-container" style={{ textAlign: "center" }}>
          <div className="section-title-wrap" style={{ marginBottom: "50px" }}>
            <h2>How MyDezineGhar Works</h2>
            <div className="dotted-divider" />
          </div>

          <div className="process-timeline">
            <div className="process-line" />
            <div className="process-line-active" />
            
            <div className="process-step active">
              <span className="step-bg-num">01</span>
              <div className="process-circle">
                <Upload />
              </div>
              <h4>Upload</h4>
            </div>

            <div className="process-step">
              <span className="step-bg-num">02</span>
              <div className="process-circle">
                <Sparkles />
              </div>
              <h4>AI Render</h4>
            </div>

            <div className="process-step">
              <span className="step-bg-num">03</span>
              <div className="process-circle">
                <Users />
              </div>
              <h4>Consult</h4>
            </div>

            <div className="process-step">
              <span className="step-bg-num">04</span>
              <div className="process-circle">
                <Compass />
              </div>
              <h4>Plan</h4>
            </div>

            <div className="process-step">
              <span className="step-bg-num">05</span>
              <div className="process-circle">
                <Rocket />
              </div>
              <h4>Realize</h4>
            </div>
          </div>

          <p className="process-bottom-desc">
            Our hybrid design process combines the power of artificial intelligence with the precision of certified interior designers to deliver perfect spaces.
          </p>
          <div className="btn-dzined-container">
            <button onClick={() => setSidebarOpen(true)} className="btn-dzined">
              GET STARTED
            </button>
            <div className="btn-dzined-shadow" />
          </div>
        </div>
      </section>

      {/* Image Categories Row */}
      <section className="categories-section" id="designs">
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <div key={i} className="category-card">
              <img src={cat.img} alt={cat.name} />
              <div className="category-overlay">
                <h3>{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Luxury Within Reach Section */}
      <section className="luxury-section">
        <div className="luxury-container">
          {/* Left Side: Geometric Overlapping Circle Compositions */}
          <div className="geometric-composite">
            <div className="composite-circle main-circle">
              <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=500&q=80" alt="Marble Counter" />
            </div>
            <div className="composite-circle offset-circle-1">
              <img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=300&q=80" alt="Modern Sink" />
            </div>
            <div className="composite-circle offset-circle-2">
              <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=300&q=80" alt="Marble texture" />
            </div>
          </div>

          {/* Right Side: Text & CTA */}
          <div className="luxury-text-block">
            <span className="sub-title">AI VISUALIZATION & CONSULTATION</span>
            <h2>Luxury Design, Made Accessible</h2>
            <p>
              Democratizing premium interior styling across India. By replacing slow, manual design iterations with our advanced AI room rendering engine and connecting you directly with vetted design consultants online, we deliver top-tier designs at a fraction of the time and cost.
            </p>
            <button onClick={() => setSidebarOpen(true)} className="btn btn-primary">
              RECONSTRUCT A ROOM
            </button>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="offer-section" id="services">
        <div className="landing-section-container">
          <div className="section-title-wrap">
            <span className="sub-title">OUR SERVICES</span>
            <h2>What We Offer</h2>
            <div className="title-divider" />
          </div>

          <div className="offer-grid">
            <div className="offer-card">
              <div className="offer-icon-box">
                <Sparkles size={24} color="var(--primary)" />
              </div>
              <h3>AI Room Generation</h3>
              <p>Upload a photo of your living room, bedroom, kitchen, or office and see it fully redesigned in 10+ visual styles instantly.</p>
              <a href="#contact" className="offer-link">Learn More <ArrowRight size={14} /></a>
            </div>

            <div className="offer-card">
              <div className="offer-icon-box">
                <Users size={24} color="var(--primary)" />
              </div>
              <h3>Expert Consultation</h3>
              <p>Connect with professional interior architects and verified consultants for space planning, color schemes, and budget guidance.</p>
              <a href="#contact" className="offer-link">Learn More <ArrowRight size={14} /></a>
            </div>

            <div className="offer-card">
              <div className="offer-icon-box">
                <Compass size={24} color="var(--primary)" />
              </div>
              <h3>Interactive Design Calls</h3>
              <p>Schedule high-definition 1-on-1 virtual design meetings with consultants directly in our web-based collaboration rooms.</p>
              <a href="#contact" className="offer-link">Learn More <ArrowRight size={14} /></a>
            </div>
          </div>

          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>AI RENDERS GENERATED</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>VETTED DESIGN CONSULTANTS</p>
            </div>
            <div className="stat-item">
              <h3>98.7%</h3>
              <p>CUSTOMER SATISFACTION</p>
            </div>
            <div className="stat-item">
              <h3>15 mins</h3>
              <p>AVERAGE MATCH TIME</p>
            </div>
          </div>

          <div className="offer-footer-cta">
            <h3>Ready to Redesign Your Home in Seconds?</h3>
            <button onClick={() => setSidebarOpen(true)} className="btn btn-primary">
              TRY AI DESIGN NOW
            </button>
          </div>
        </div>
      </section>

      {/* Essential Business Tenets Section */}
      <section className="tenets-section">
        <div className="tenets-container">
          {/* Left Side: Accordion & Copy */}
          <div className="tenets-text-block">
            <span className="sub-title">OUR CORE VALUE</span>
            <h2>Our Core Design Philosophy</h2>
            <p>
              We blend state-of-the-art visual generation technology with real-world architectural design principles to ensure a seamless experience.
            </p>

            <div className="tenets-accordion">
              {tenets.map((tenet, idx) => {
                const isActive = activeTenet === idx;
                return (
                  <div key={idx} className={`tenet-item ${isActive ? "active" : ""}`} onClick={() => setActiveTenet(isActive ? null : idx)}>
                    <div className="tenet-header">
                      <span>{idx + 1}. {tenet.title}</span>
                      <ChevronDown size={18} className="tenet-arrow" />
                    </div>
                    {isActive && (
                      <div className="tenet-body">
                        <p>{tenet.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Blueprint Composite Circle */}
          <div className="blueprint-composite">
            <div className="blueprint-circle">
              <img src={blueprints} alt="Drafting blueprints" />
            </div>
            <div className="blueprint-label label-experience">
              <span>AI DESIGN</span>
            </div>
            <div className="blueprint-label label-materials">
              <span>LIVE CONSULTING</span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team of Experts Section */}
      {/* <section className="team-section" id="portfolio">
        <div className="landing-section-container">
          <div className="section-title-wrap">
            <span className="sub-title">OUR CONSULTANTS</span>
            <h2>Featured Design Experts</h2>
            <div className="title-divider" />
          </div>

          <div className="team-grid">
            {team.map((member, i) => (
              <div key={i} className="team-card">
                <div className="team-img-box">
                  <img src={member.img} alt={member.name} />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-indicators">
            <span className="dot active" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      </section> */}

      {/* Mobile App Download Section */}
      <section className="app-download-section">
        <div className="app-download-container">
          <div className="app-text-block">
            <span className="sub-title">MYDEZINEGHAR ON THE GO</span>
            <h2>Redesign Rooms in Seconds, Anywhere</h2>
            <p>
              Download our official mobile app to generate instant AI interior visualisations, browse design catalogs, and manage your consultant bookings directly from your phone.
            </p>
            <div className="download-badges">
              <a href="#" className="playstore-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.60938 2.05267C3.41438 2.25767 3.30078 2.59367 3.30078 3.01867V20.9827C3.30078 21.4077 3.41438 21.7437 3.60938 21.9487L3.68938 22.0187L13.7384 11.9697V11.7587L3.68938 1.70867L3.60938 2.05267Z" fill="#00E5FF"/>
                  <path d="M17.0789 15.3134L13.7378 11.9723V11.7613L17.0799 8.42025L17.1599 8.46825L21.1189 10.7183C22.2489 11.3583 22.2489 12.4023 21.1189 13.0423L17.1599 15.2923L17.0789 15.3134Z" fill="#FFC107"/>
                  <path d="M3.68945 22.0183L13.7385 11.9692L17.0805 15.3113L3.68945 22.0183Z" fill="#FF3D00"/>
                  <path d="M3.68945 1.70898L17.0805 9.08802L13.7385 12.4301L3.68945 1.70898Z" fill="#4CAF50"/>
                </svg>
                <div className="playstore-text">
                  <span className="ps-small">GET IT ON</span>
                  <span className="ps-bold">Google Play</span>
                </div>
              </a>
            </div>
          </div>
          <div className="app-mockup-block">
            <img src={mobileMockup} alt="MyDezineGhar Mobile App Mockup" className="app-mockup-img" />
          </div>
        </div>
      </section>

      {/* See you again / Newsletter Section */}
      <section className="newsletter-section" id="contact">
        <div className="landing-section-container">
          <h2>Join the Future of Design</h2>
          <p>Subscribe to receive the latest AI design trends, design catalogs, and notifications about new consulting slots.</p>
          
          <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed successfully!"); }} className="newsletter-form">
            <input type="email" placeholder="Your Email Address" className="form-input" required />
            <button type="submit" className="btn btn-primary">SUBSCRIBE</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-strip">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <img src={logo} alt="MydesignGhar Logo" style={{ height: "28px", objectFit: "contain", marginRight: "4px" }} />
              <div className="logo-text-stack">
                <span className="logo-top">Mydesign</span>
                <span className="logo-bottom">Ghar</span>
              </div>
            </div>
            <p>Transform your space in seconds with AI and book 1-on-1 virtual design consultations with top vetted Indian specialists.</p>
            <div className="footer-socials">
              <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" aria-label="Pinterest">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.41 7.61 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.27 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.62 0 11.988-5.367 11.988-11.987C24.005 5.368 18.636 0 12.017 0z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>CONTACT</h4>
            <p className="contact-text">
              <Mail size={14} style={{ marginRight: "6px" }} />
              <span>mydesignghr.com</span>
            </p>
          </div>

          <div className="footer-links-col">
            <h4>QUICK LINKS</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#designs">Designs</a></li>
              <li><a href="#portfolio">Portfolio</a></li>
              <li><button type="button" onClick={(e) => handleAdminAccess(e)} className="text-btn">Admin Panel</button></li>
              <li><Link to="/consultant/login" className="footer-consultant-btn">Consultant Portal</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MydesignGhar. All Rights Reserved. Powered by MydesignGhar.</p>
        </div>
      </footer>

      {/* Landing Specific Styles */}
      <style>{`
        /* Global override variables just for landing */
        .landing-root {
          background-color: #ffffff;
          color: #111215;
          font-family: var(--font-sans);
          overflow-x: hidden;
        }

        .landing-section-container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        /* Nav Header styling */
        .nav-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #000000;
          z-index: 500;
          height: 80px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .nav-container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
        }
        .logo-text-stack {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
          text-align: left;
        }
        .logo-top {
          font-size: 16px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .logo-bottom {
          font-size: 15px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.85);
          letter-spacing: 0.5px;
        }
        .nav-menu {
          display: flex;
          list-style: none;
          gap: 32px;
          margin: 0;
          padding: 0;
        }
        .nav-menu a {
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-menu a:hover {
          color: var(--primary);
        }
        .arrow-down {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 1px;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .icon-action-btn {
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }
        .icon-action-btn:hover {
          color: var(--primary);
        }
        .nav-separator {
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.15);
          margin: 0 4px;
        }
        .icon-action-btn.hamburger {
          display: flex;
        }

        .btn-consultant-nav {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 8px 16px;
          border-radius: 6px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .btn-consultant-nav:hover {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
        }

        .footer-links-col .footer-consultant-btn {
          color: var(--primary) !important;
          font-weight: 700;
        }

        /* Drawer Overlay */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .drawer-overlay.open {
          opacity: 1;
          pointer-events: all;
        }
        .drawer-panel {
          position: fixed;
          top: 0;
          right: -400px;
          width: 100%;
          max-width: 400px;
          height: 100vh;
          background: #111215;
          z-index: 1001;
          box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }
        .drawer-panel.open {
          right: 0;
        }
        .drawer-header {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .drawer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 18px;
          color: #ffffff;
        }
        .drawer-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
        }
        .drawer-close:hover {
          color: #ffffff;
        }
        .drawer-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }
        .drawer-content h4 {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--primary);
          margin-bottom: 16px;
          font-weight: 700;
        }
        .drawer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 30px;
        }
        .drawer-thumb {
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .drawer-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .drawer-contact-info {
          margin-bottom: 30px;
        }
        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .contact-item svg {
          color: var(--primary);
          margin-top: 2px;
          flex-shrink: 0;
        }
        .drawer-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .drawer-link-btn {
          width: 100%;
          text-align: center;
          text-decoration: none;
          display: block;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          box-sizing: border-box;
        }
        .btn-admin {
          background: rgba(205, 162, 80, 0.1);
          color: var(--primary);
          border: 1px solid rgba(205, 162, 80, 0.2);
          cursor: pointer;
        }
        .btn-admin:hover {
          background: rgba(205, 162, 80, 0.2);
        }

        /* Hero Section Styling (Centred layout, STUDIO background) */
        .hero-viewport {
          min-height: 100vh;
          position: relative;
          background-image: url("${heroBg}");
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 80px;
          color: #ffffff;
          box-sizing: border-box;
        }
        .hero-bg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(11, 12, 16, 0.65);
          z-index: 1;
        }
        .hero-bg-outline-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 15vw;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 24px;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.12);
          pointer-events: none;
          z-index: 1;
          white-space: nowrap;
          font-family: inherit;
        }
        .hero-social-bar {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          z-index: 10;
          width: 80px;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          padding: 40px 0;
        }
        .social-link {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
          writing-mode: vertical-lr;
          transform: rotate(180deg);
          transition: color 0.2s ease;
        }
        .social-link:hover {
          color: var(--primary);
        }
        .social-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }

        .hero-wrapper {
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          padding: 40px 24px;
          text-align: center;
          position: relative;
          z-index: 2;
        }
        .hero-text-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .hero-text-block h1 {
          font-size: 58px;
          font-weight: 300;
          line-height: 1.2;
          letter-spacing: 0.5px;
          margin-bottom: 24px;
          color: #ffffff;
        }
        .hero-text-block p {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.85);
          max-width: 620px;
          margin-bottom: 40px;
        }
        .btn-contact-hero {
          background: rgba(11, 12, 16, 0.6);
          border: 1px solid #ffffff;
          padding: 16px 36px;
          font-family: inherit;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-contact-hero:hover {
          background: #ffffff;
          color: #000000;
        }

        /* Bottom Right Slider arrows */
        .hero-slider-controls {
          position: absolute;
          bottom: 0;
          right: 0;
          display: flex;
          z-index: 10;
        }
        .slider-arrow-btn {
          background: rgba(11, 12, 16, 0.4);
          border: none;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 20px;
        }
        .slider-arrow-btn:hover {
          background: #ffffff;
          color: #000000;
        }
        .slider-arrow-btn.next-arrow {
          background: rgba(255, 255, 255, 0.18);
        }

        /* Quote Section (White background) */
        .quote-banner {
          background: #ffffff;
          padding: 80px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          color: #111215;
        }
        .quote-container {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 40px;
        }
        .quote-avatar-box {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid var(--primary);
        }
        .quote-avatar-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .quote-text-box blockquote {
          font-size: 22px;
          font-weight: 500;
          line-height: 1.55;
          color: #111215;
          margin: 0 0 16px 0;
          font-style: italic;
        }
        .quote-author {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .author-name {
          font-weight: 700;
          color: var(--primary);
        }
        .author-role {
          color: #666666;
        }
        .author-signature {
          margin-left: auto;
          font-family: cursive;
          font-size: 32px;
          text-transform: none;
          color: rgba(0, 0, 0, 0.15);
          transform: rotate(-5deg);
        }

        /* Brand Strip Styling (White background) */
        .brand-strip {
          background: #ffffff;
          padding: 40px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .brand-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .brand-logo-item {
          font-size: 22px;
          font-weight: 800;
          color: rgba(0, 0, 0, 0.4);
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .brand-logo-item span {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(0, 0, 0, 0.25);
        }

        /* Common Section Title Wrap */
        .section-title-wrap {
          text-align: center;
          margin-bottom: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .section-title-wrap h2 {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 12px;
        }
        .sub-title {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--primary);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .title-divider {
          width: 60px;
          height: 3px;
          background: var(--primary);
          margin-top: 8px;
        }

        /* 5D Process Section Styling (Dark background) */
        .process-section {
          width: 100%;
          background: #0f1013;
          color: #ffffff;
          padding: 100px 24px;
          box-sizing: border-box;
          margin: 0;
        }
        .process-section .section-title-wrap h2 {
          color: #ffffff;
          font-size: 32px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .process-section .dotted-divider {
          width: 60px;
          border-bottom: 2px dotted rgba(255, 255, 255, 0.4);
          margin: 10px auto 0 auto;
        }
        .process-timeline {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 900px;
          margin: 80px auto 40px auto;
        }
        .process-line {
          position: absolute;
          top: 45px;
          left: 45px;
          right: 45px;
          height: 1.5px;
          background: rgba(255, 255, 255, 0.15);
          z-index: 1;
        }
        .process-line-active {
          position: absolute;
          top: 45px;
          left: 0;
          width: calc(10% + 45px);
          height: 2px;
          background: #ffffff;
          z-index: 2;
        }
        .process-step {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          z-index: 3;
        }
        .step-bg-num {
          font-size: 64px;
          font-weight: 800;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.25);
          position: absolute;
          top: -46px;
          left: -12px;
          z-index: 1;
          pointer-events: none;
          font-family: inherit;
        }
        .process-circle {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: #000000;
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
        }
        .process-circle svg {
          width: 28px;
          height: 28px;
          stroke-width: 1.5px;
        }
        .process-step.active .process-circle {
          background: #ffffff;
          border-color: #ffffff;
          color: #000000;
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.35);
        }
        .process-step.active .process-circle svg {
          stroke: #000000;
        }
        .process-step h4 {
          font-size: 15px;
          font-weight: 500;
          color: #ffffff;
          margin-top: 4px;
        }
        .process-bottom-desc {
          max-width: 600px;
          margin: 40px auto 20px auto;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.6);
        }
        .btn-dzined-container {
          position: relative;
          display: inline-block;
          margin: 20px auto 0 auto;
        }
        .btn-dzined {
          background: #ffffff;
          color: #000000;
          border: 1px solid #000000;
          padding: 14px 36px;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          z-index: 2;
        }
        .btn-dzined-shadow {
          position: absolute;
          top: 5px;
          left: 5px;
          width: 100%;
          height: 100%;
          border: 1.5px solid #ffffff;
          z-index: 1;
          pointer-events: none;
        }
        .btn-dzined-container:hover .btn-dzined {
          transform: translate(2px, 2px);
        }
        .btn-dzined-container:hover .btn-dzined-shadow {
          transform: translate(-1px, -1px);
        }

        /* Categories Section Grid */
        .categories-section {
          width: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .category-card {
          position: relative;
          height: 380px;
          overflow: hidden;
          cursor: pointer;
        }
        .category-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .category-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.1) 80%);
          display: flex;
          align-items: flex-end;
          padding: 24px;
          z-index: 2;
        }
        .category-card h3 {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          transform: translateY(8px);
          transition: transform 0.3s ease;
          margin: 0;
        }
        .category-card:hover img {
          transform: scale(1.08);
        }
        .category-card:hover h3 {
          transform: translateY(0);
          color: var(--primary);
        }

        /* Luxury within Reach (White background) */
        .luxury-section {
          background: #ffffff;
          color: #111215;
          padding: 100px 24px;
          box-sizing: border-box;
          margin: 0;
          width: 100%;
        }
        .luxury-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .geometric-composite {
          position: relative;
          height: 400px;
          width: 100%;
        }
        .composite-circle {
          position: absolute;
          overflow: hidden;
          border-radius: 50%;
          border: 4px solid #ffffff;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
        }
        .composite-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .main-circle {
          top: 0;
          left: 40px;
          width: 280px;
          height: 280px;
          z-index: 2;
        }
        .offset-circle-1 {
          bottom: 20px;
          right: 60px;
          width: 200px;
          height: 200px;
          z-index: 3;
        }
        .offset-circle-2 {
          top: 40px;
          right: 20px;
          width: 120px;
          height: 120px;
          z-index: 1;
        }
        .luxury-text-block {
          text-align: left;
        }
        .luxury-text-block h2 {
          font-size: 42px;
          font-weight: 800;
          margin: 12px 0 20px 0;
          color: #111215;
        }
        .luxury-text-block p {
          font-size: 16px;
          line-height: 1.7;
          color: #444444;
          margin-bottom: 30px;
        }

        /* What We Offer Grid Styling (Dark background) */
        .offer-section {
          width: 100%;
          background: #0f1013;
          color: #ffffff;
          padding: 100px 24px;
          box-sizing: border-box;
          margin: 0;
        }
        .offer-section .section-title-wrap h2 {
          color: #ffffff;
        }
        .offer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 60px;
        }
        
        /* Cards inside What We Offer: White background, black text */
        .offer-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          padding: 40px 30px;
          border-radius: 16px;
          text-align: left;
          color: #111215;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        .offer-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }
        .offer-icon-box {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: rgba(205, 162, 80, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .offer-card h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #111215;
        }
        .offer-card p {
          font-size: 14px;
          line-height: 1.6;
          color: #555555;
          margin-bottom: 24px;
        }
        .offer-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
          transition: gap 0.2s ease;
        }
        .offer-card:hover .offer-link {
          gap: 10px;
        }

        /* Stats Row */
        .stats-row {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 40px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 60px;
        }
        .stat-item h3 {
          font-size: 36px;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 6px;
          margin-top: 0;
        }
        .stat-item p {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }
        .offer-footer-cta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, rgba(205, 162, 80, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
          border: 1px solid rgba(205, 162, 80, 0.18);
          padding: 30px 40px;
          border-radius: 16px;
          text-align: left;
        }
        .offer-footer-cta h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #ffffff;
        }

        /* Essential Tenets Accordion & Blueprints (White background) */
        .tenets-section {
          width: 100%;
          background: #ffffff;
          color: #111215;
          padding: 100px 24px;
          box-sizing: border-box;
          margin: 0;
        }
        .tenets-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 80px;
          align-items: center;
        }
        .tenets-text-block {
          text-align: left;
        }
        .tenets-text-block h2 {
          font-size: 42px;
          font-weight: 800;
          margin: 12px 0 20px 0;
          color: #111215;
        }
        .tenets-text-block p {
          color: #555555;
          font-size: 15px;
          margin-bottom: 30px;
        }
        .tenets-accordion {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tenet-item {
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding-bottom: 16px;
          cursor: pointer;
        }
        .tenet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          font-size: 16px;
          color: #111215;
          transition: color 0.2s ease;
        }
        .tenet-item:hover .tenet-header,
        .tenet-item.active .tenet-header {
          color: var(--primary);
        }
        .tenet-arrow {
          transition: transform 0.3s ease;
          color: rgba(0, 0, 0, 0.4);
        }
        .tenet-item.active .tenet-arrow {
          transform: rotate(180deg);
          color: var(--primary);
        }
        .tenet-body {
          padding-top: 12px;
          font-size: 14px;
          line-height: 1.6;
          color: #555555;
        }
        .blueprint-composite {
          position: relative;
          height: 380px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .blueprint-circle {
          width: 280px;
          height: 280px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #ffffff;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        .blueprint-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .blueprint-label {
          position: absolute;
          background: var(--primary);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          box-shadow: 0 8px 20px rgba(205, 162, 80, 0.3);
        }
        .label-experience {
          top: 60px;
          right: 40px;
        }
        .label-materials {
          bottom: 60px;
          left: 40px;
        }

        /* Team Section Styling (Dark background) */
        .team-section {
          width: 100%;
          background: #0f1013;
          color: #ffffff;
          padding: 100px 24px;
          box-sizing: border-box;
          margin: 0;
        }
        .team-section .section-title-wrap h2 {
          color: #ffffff;
        }
        .team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        
        /* Darker cards inside team grid */
        .team-card {
          background: #16171b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .team-card:hover {
          transform: translateY(-5px);
          border-color: rgba(205, 162, 80, 0.25);
        }
        .team-img-box {
          height: 280px;
          overflow: hidden;
        }
        .team-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(1);
          transition: filter 0.3s ease, transform 0.5s ease;
        }
        .team-card:hover .team-img-box img {
          filter: grayscale(0);
          transform: scale(1.03);
        }
        .team-info {
          padding: 20px 16px;
          text-align: left;
        }
        .team-info h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #ffffff;
          margin-top: 0;
        }
        .team-info p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }
        .carousel-indicators {
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .carousel-indicators .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
        }
        .carousel-indicators .dot.active {
          background: var(--primary);
          width: 16px;
          border-radius: 30px;
        }

        /* Mobile App Download Section */
        .app-download-section {
          background: #090a0d;
          color: #ffffff;
          padding: 100px 24px;
          box-sizing: border-box;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          overflow: hidden;
        }
        .app-download-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 80px;
          align-items: center;
        }
        .app-text-block {
          text-align: left;
        }
        .app-text-block h2 {
          font-size: 42px;
          font-weight: 800;
          margin: 12px 0 20px 0;
          color: #ffffff;
          line-height: 1.2;
        }
        .app-text-block p {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 35px;
          max-width: 540px;
        }
        .download-badges {
          display: flex;
          gap: 16px;
        }
        .playstore-btn {
          background: #000000;
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #ffffff;
          transition: all 0.2s ease;
          width: fit-content;
        }
        .playstore-btn:hover {
          background: #111215;
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.05);
        }
        .playstore-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.2;
        }
        .ps-small {
          font-size: 9px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .ps-bold {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
        }
        
        .app-mockup-block {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .app-mockup-img {
          max-width: 100%;
          height: auto;
          max-height: 480px;
          object-fit: contain;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .app-mockup-block:hover .app-mockup-img {
          transform: translateY(-8px) scale(1.02);
        }

        /* See you again / Newsletter styling (White background) */
        .newsletter-section {
          width: 100%;
          background: #ffffff;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          padding: 80px 24px;
          text-align: center;
          color: #111215;
          box-sizing: border-box;
          margin: 0;
        }
        .newsletter-section h2 {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 12px;
          color: #111215;
        }
        .newsletter-section p {
          color: #555555;
          max-width: 500px;
          margin: 0 auto 30px auto;
          font-size: 15px;
          line-height: 1.5;
        }
        .newsletter-form {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          gap: 12px;
        }
        .newsletter-form .form-input {
          flex: 1;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          color: #111215;
          padding: 14px 16px;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
        }
        .newsletter-form .form-input:focus {
          background: #ffffff;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(205, 162, 80, 0.15);
        }

        /* Footer Strip styling (Near Black background) */
        .footer-strip {
          background: #090a0d;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          padding: 80px 24px 30px 24px;
          color: rgba(255, 255, 255, 0.6);
          box-sizing: border-box;
        }
        .footer-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr 0.8fr;
          gap: 60px;
          margin-bottom: 40px;
        }
        .footer-brand-col p {
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 16px;
          margin-bottom: 20px;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 18px;
          color: #ffffff;
        }
        .footer-socials {
          display: flex;
          gap: 12px;
        }
        .footer-socials a {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .footer-socials a:hover {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }
        .footer-links-col h4 {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--primary);
          margin-bottom: 24px;
          margin-top: 0;
        }
        .contact-text {
          display: flex;
          align-items: flex-start;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .contact-text svg {
          color: var(--primary);
        }
        .footer-links-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links-col a,
        .footer-links-col .text-btn {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: color 0.2s ease;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
        }
        .footer-links-col a:hover,
        .footer-links-col .text-btn:hover {
          color: var(--primary);
        }
        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 24px;
          text-align: center;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .hero-viewport {
            height: auto;
            min-height: auto;
            padding: 160px 0 100px 0;
          }
          .hero-bg-outline-text {
            display: none;
          }
          .hero-social-bar {
            display: none;
          }
          .hero-wrapper {
            padding: 40px 80px;
          }
          .hero-text-block h1 {
            font-size: 44px;
          }
          .luxury-container, .tenets-container {
            grid-template-columns: 1fr;
            gap: 50px;
          }
          .offer-grid, .team-grid {
            grid-template-columns: 1fr 1fr;
          }
          .stats-row {
            grid-template-columns: 1fr 1fr;
          }
          .composite-circle, .blueprint-composite {
            margin: 0 auto;
          }
          .app-download-container {
            grid-template-columns: 1fr;
            gap: 50px;
            text-align: center;
          }
          .app-text-block {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .app-text-block p {
            margin-left: auto;
            margin-right: auto;
          }
          .composite-circle {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .nav-menu {
            display: none;
          }
          .icon-action-btn.hamburger {
            display: flex;
          }
          .hero-wrapper {
            padding: 40px 24px;
          }
          .hero-text-block h1 {
            font-size: 36px;
          }
          .categories-grid {
            grid-template-columns: 1fr 1fr;
          }
          .quote-container {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }
          .author-signature {
            display: none;
          }
          .brand-container {
            justify-content: center;
          }
          .offer-grid, .team-grid {
            grid-template-columns: 1fr;
          }
          .stats-row {
            grid-template-columns: 1fr;
            padding: 20px;
          }
          .offer-footer-cta {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .process-timeline {
            flex-direction: column;
            gap: 30px;
            margin: 40px auto 30px auto;
          }
          .process-line, .process-line-active {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
