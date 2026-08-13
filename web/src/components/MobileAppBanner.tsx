import { useState } from 'react';
import { Smartphone, Sparkles, Camera, Video, Calculator, Bell, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MobileAppBanner() {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail) return;

    try {
      const existingStr = localStorage.getItem('mdg_app_waitlist') || '[]';
      const existingList = JSON.parse(existingStr);
      existingList.push({ contact: phoneOrEmail, date: new Date().toISOString() });
      localStorage.setItem('mdg_app_waitlist', JSON.stringify(existingList));
    } catch (_) {}

    setIsSubscribed(true);
  };

  return (
    <section className="mobile-app-section" id="mobile-app-launch">
      <div className="mobile-app-shell">
        <div className="mobile-app-glass-card">
          <div className="mobile-app-content-col">
            <div className="mobile-app-badge-pill">
              <Smartphone size={15} className="app-phone-icon" />
              <span>MOBILE APP LAUNCHING SOON</span>
              <span className="app-live-dot" />
            </div>

            <h2 className="mobile-app-title">
              Interior Design in Your Pocket, <span className="title-gradient">Anywhere</span>
            </h2>

            <p className="mobile-app-desc">
              Scan your rooms in 3D using your phone camera, generate AI spatial renderings in 60 seconds, and connect with certified architects via 1-on-1 video calls.
            </p>

            {/* App Features List */}
            <div className="mobile-app-features-grid">
              <div className="app-feature-card">
                <div className="app-feature-icon-box">
                  <Camera size={18} />
                </div>
                <div>
                  <h4>AR Room Scanner</h4>
                  <p>Capture room walls &amp; dimensions instantly with AR camera</p>
                </div>
              </div>

              <div className="app-feature-card">
                <div className="app-feature-icon-box">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4>1-Click AI Stylist</h4>
                  <p>Generate 25+ Indian &amp; modern spatial themes on mobile</p>
                </div>
              </div>

              <div className="app-feature-card">
                <div className="app-feature-icon-box">
                  <Video size={18} />
                </div>
                <div>
                  <h4>Live Architect Calls</h4>
                  <p>Schedule instant 1-on-1 video consultations on the go</p>
                </div>
              </div>

              <div className="app-feature-card">
                <div className="app-feature-icon-box">
                  <Calculator size={18} />
                </div>
                <div>
                  <h4>Live Cost Calculator</h4>
                  <p>Real-time estimation for materials across Indian cities</p>
                </div>
              </div>
            </div>

            {/* Store Download Badges & Notify Form */}
            <div className="mobile-app-stores-row">
              <div className="store-badge-box app-store">
                <span className="store-icon"></span>
                <div className="store-text">
                  <span className="store-sub">COMING SOON ON</span>
                  <strong className="store-name">App Store</strong>
                </div>
              </div>

              <div className="store-badge-box play-store">
                <span className="store-icon">▶</span>
                <div className="store-text">
                  <span className="store-sub">COMING SOON ON</span>
                  <strong className="store-name">Google Play</strong>
                </div>
              </div>
            </div>

            {/* VIP Early Access Form */}
            <div className="mobile-app-notify-box">
              {isSubscribed ? (
                <div className="notify-success-msg">
                  <CheckCircle2 size={20} className="success-icon" />
                  <span>You&apos;re on the VIP Launch List! We&apos;ll notify you first when the app goes live.</span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="notify-form">
                  <div className="notify-input-wrapper">
                    <Bell size={18} className="bell-icon" />
                    <input
                      type="text"
                      placeholder="Enter mobile number or email for launch invite"
                      value={phoneOrEmail}
                      onChange={(e) => setPhoneOrEmail(e.target.value)}
                      className="notify-input"
                      required
                    />
                  </div>
                  <button type="submit" className="notify-submit-btn">
                    <span>Get Early Access</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Mobile Phone Mockup Preview */}
          <div className="mobile-app-mockup-col">
            <div className="phone-mockup-container">
              <div className="phone-screen-glare" />
              <div className="phone-camera-notch" />
              
              <div className="phone-screen-content">
                <div className="phone-app-header">
                  <span className="phone-app-logo">MYDESIGNGHAR</span>
                  <span className="phone-app-badge">AR AI Live</span>
                </div>

                <div className="phone-room-preview">
                  <img src="/images/project-living.png" alt="AR Spatial Room Preview" className="phone-preview-img" />
                  <div className="phone-ar-overlay">
                    <span className="ar-tag"><Sparkles size={11} /> Teak &amp; Quartz Mood</span>
                    <span className="ar-dim">350 sq ft • 3D Rendered</span>
                  </div>
                </div>

                <div className="phone-app-stats">
                  <div className="phone-stat-pill">
                    <strong>4.9 ★</strong>
                    <span>Rating</span>
                  </div>
                  <div className="phone-stat-pill">
                    <strong>50K+</strong>
                    <span>Waitlist</span>
                  </div>
                  <div className="phone-stat-pill">
                    <strong>iOS &amp; Android</strong>
                    <span>Cross Platform</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
