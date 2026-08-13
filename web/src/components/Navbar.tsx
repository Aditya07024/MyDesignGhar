import { ChevronDown, UserCheck } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Navbar() {
  return (
    <nav className="nav-container glass-nav-pill">
      <a href="#home" className="logo">
        <img src={logo} alt="MyDesignGhar" className="nav-logo-img" />
        <span className="logo-text">MY<span className="logo-orange">DESIGNGHAR</span></span>
      </a>

      <ul className="nav-links">
        <li><a href="#about">About</a></li>
        <li className="dropdown">
          <span className="dropdown-trigger">
            Services
            <ChevronDown size={14} style={{ marginLeft: '4px', opacity: 0.7 }} />
          </span>
          <div className="dropdown-menu">
            <a href="#ai-styling">AI Room Generation</a>
            <a href="#consultation">Virtual Consultant</a>
            <a href="#projects">Custom Spaces</a>
            <a href="/consultant/login">Designer Portal</a>
          </div>
        </li>
        <li><a href="#projects">Our Projects</a></li>
        <li><a href="#ai-styling">Gallery</a></li>
      </ul>

      <div className="nav-actions-group">
        <a href="/consultant/login" className="nav-portal-btn designer-btn" title="Designer Portal Login">
          <UserCheck size={16} />
          <span>Designer Login</span>
        </a>

        {/* <a href="#quote" className="nav-cta-link">
          <button className="cta-nav-button">
            Request a Quote
            <span className="chevron-box">
              <ArrowRight size={14} strokeWidth={2.5} />
            </span>
          </button>
        </a> */}
      </div>
    </nav>
  );
}
