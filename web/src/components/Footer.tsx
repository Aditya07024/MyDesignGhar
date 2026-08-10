import { ArrowRight, CalendarDays, FolderHeart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div>
          <a href="#" className="footer-logo">
            MY<span>DESIGNGHAR</span>
          </a>
          <p className="footer-desc">
            Pioneering the democratization of interior designing through advanced automated AI spatial renderings and premium virtual architect consultations.
          </p>
          <div className="footer-socials">
            <a href="#" className="footer-social-link" aria-label="Social Link 1">
              <Sparkles size={18} />
            </a>
            <a href="#" className="footer-social-link" aria-label="Social Link 2">
              <FolderHeart size={18} />
            </a>
            <a href="#" className="footer-social-link" aria-label="Social Link 3">
              <CalendarDays size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="footer-heading">Services</h4>
          <ul className="footer-links">
            <li><a href="#ai-styling">AI Room Styling</a></li>
            <li><a href="#consultation">Virtual Consultations</a></li>
            <li><a href="#projects">Residential Design</a></li>
            <li><a href="#projects">Corporate Workspaces</a></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><a href="#home">About Us</a></li>
            <li><a href="#projects">Our Portfolio</a></li>
            <li><a href="#consultation">Our Method</a></li>
            <li><a href="#quote">Contact Studio</a></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Join Our Newsletter</h4>
          <p className="footer-newsletter-text">Subscribe to receive design inspirations, interior styling articles, and product releases.</p>
          <div className="footer-input-group">
            <input type="email" placeholder="Your email address" className="footer-input" aria-label="Email for Newsletter" />
            <button className="footer-submit" aria-label="Subscribe">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MYDESIGNGHAR. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
