import { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Search,
  MessageSquarePlus,
  Compass,
  CheckCircle2,
  Wand2,
  Send,
  MapPin,
  Tag,
} from 'lucide-react';

interface CommunityIdea {
  id: string;
  name: string;
  location: string;
  roomType: string;
  style: string;
  vision: string;
  likes: number;
  date: string;
  isUserLiked?: boolean;
}

const initialCommunityIdeas: CommunityIdea[] = [
  {
    id: '1',
    name: 'Aarav & Meera K.',
    location: 'Bengaluru, KA',
    roomType: 'Modular Kitchen',
    style: 'Warm Teak & Quartz',
    vision: 'A crisp kitchen with warm teak wood lower cabinets, seamless white quartz countertop, ambient under-cabinet LED bar, and a hidden pull-out pantry unit for tight urban spaces.',
    likes: 42,
    date: '2 hours ago',
  },
  {
    id: '2',
    name: 'Rohan Deshmukh',
    location: 'Pune, MH',
    roomType: 'Master Bedroom',
    style: 'Scandinavian Light',
    vision: 'A minimalist bedroom suite with acoustic wooden slat headboard paneling, soft warm dimmable recessed lights, built-in floating side tables, and neutral linen curtains.',
    likes: 38,
    date: '5 hours ago',
  },
  {
    id: '3',
    name: 'Ananya & Vikram',
    location: 'New Delhi, DL',
    roomType: 'Living & Dining',
    style: 'Heritage Brass & Marble',
    vision: 'An open-plan living room featuring Italian beige marble flooring, brass inlaid accent walls, plush cognac leather sofa, and biophilic indoor greenery corners.',
    likes: 56,
    date: '1 day ago',
  },
  {
    id: '4',
    name: 'Priya Iyer',
    location: 'Kochi, KL',
    roomType: 'Pooja & Mandir',
    style: 'Kerala Teak & Brass',
    vision: 'A serene pooja alcove crafted with solid Kerala teakwood, hand-carved bell lattice doors, back-lit warm golden stone wall, and brass brassware niches.',
    likes: 29,
    date: '2 days ago',
  },
  {
    id: '5',
    name: 'Siddharth Roy',
    location: 'Kolkata, WB',
    roomType: 'Home Office',
    style: 'Modern Industrial',
    vision: 'An ergonomic home study with matte black metal framing, rich walnut floating desk, ambient backlight bar, and floor-to-ceiling book display racks.',
    likes: 31,
    date: '3 days ago',
  },
];

const categoryFilters = ['All Visions', 'Modular Kitchen', 'Master Bedroom', 'Living & Dining', 'Pooja Room', 'Home Office'];

export default function CommunityIdeasWall() {
  const [ideas, setIdeas] = useState<CommunityIdea[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All Visions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  // Form State
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [userRoomType, setUserRoomType] = useState('Modular Kitchen');
  const [userStyle, setUserStyle] = useState('Modern Minimalist');
  const [userVision, setUserVision] = useState('');

  useEffect(() => {
    const fetchBackendIdeas = async () => {
      try {
        let res = await fetch('http://localhost:5000/api/ideas').catch(() => null);
        if (!res || !res.ok) {
          res = await fetch('http://localhost:5001/api/ideas').catch(() => null);
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.ideas && data.ideas.length > 0) {
            setIdeas(data.ideas);
            localStorage.setItem('mdg_community_ideas', JSON.stringify(data.ideas));
            return;
          }
        }
      } catch (err) {
        console.warn('Backend service offline. Loading local database ideas.', err);
      }

      // Local storage fallback
      try {
        const stored = localStorage.getItem('mdg_community_ideas');
        if (stored) {
          setIdeas(JSON.parse(stored));
        } else {
          setIdeas(initialCommunityIdeas);
          localStorage.setItem('mdg_community_ideas', JSON.stringify(initialCommunityIdeas));
        }
      } catch (_) {
        setIdeas(initialCommunityIdeas);
      }
    };

    void fetchBackendIdeas();
  }, []);

  const handleLike = async (id: string) => {
    const updated = ideas.map((idea) => {
      if (idea.id === id) {
        const isLiked = idea.isUserLiked;
        return {
          ...idea,
          likes: isLiked ? idea.likes - 1 : idea.likes + 1,
          isUserLiked: !isLiked,
        };
      }
      return idea;
    });
    setIdeas(updated);
    try {
      localStorage.setItem('mdg_community_ideas', JSON.stringify(updated));
    } catch (_) {}

    // Send like ping to backend API
    try {
      await fetch(`http://localhost:5000/api/ideas/${id}/like`, { method: 'POST' }).catch(() => null);
    } catch (_) {}
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userVision.trim()) return;

    const payload = {
      name: userName,
      location: userLocation || 'India',
      roomType: userRoomType,
      style: userStyle,
      vision: userVision,
    };

    const newIdea: CommunityIdea = {
      id: Date.now().toString(),
      name: payload.name,
      location: payload.location,
      roomType: payload.roomType,
      style: payload.style,
      vision: payload.vision,
      likes: 1,
      date: 'Just now',
      isUserLiked: true,
    };

    // Update state & local storage immediately
    const updated = [newIdea, ...ideas];
    setIdeas(updated);
    try {
      localStorage.setItem('mdg_community_ideas', JSON.stringify(updated));
    } catch (_) {}

    // Async POST to backend API
    try {
      await fetch('http://localhost:5000/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);
    } catch (_) {}

    setIsSubmittedSuccess(true);
    setTimeout(() => {
      setShowSubmitModal(false);
      setIsSubmittedSuccess(false);
      setUserName('');
      setUserLocation('');
      setUserVision('');
    }, 2000);
  };

  // Filtered Ideas
  const filteredIdeas = ideas.filter((idea) => {
    const matchesCategory =
      activeCategory === 'All Visions' ||
      idea.roomType.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch =
      searchQuery === '' ||
      idea.vision.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="community-ideas-section" id="community-ideas">
      <div className="community-ideas-shell">
        {/* Section Header */}
        <div className="ideas-header-wrapper reveal-item">
          <div className="ideas-badge-pill">
            <Sparkles size={14} className="ideas-sparkle-icon" />
            <span>COMMUNITY VISION &amp; IDEAS HUB</span>
            <span className="ideas-live-dot" />
          </div>
          <h2 className="ideas-main-title">
            What India Dreams When <span className="title-gradient">Building a House</span>
          </h2>
          <p className="ideas-main-desc">
            Explore real home concepts &amp; room visions shared by homeowners across India. Get inspired for your own dream home, or share your custom vision with the community!
          </p>
        </div>

        {/* Action Bar & Search / Category Filters */}
        <div className="ideas-action-bar reveal-item">
          <div className="ideas-category-pills">
            {categoryFilters.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="ideas-search-cta-group">
            <div className="ideas-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by state, marble, teak, style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="share-vision-btn"
              onClick={() => setShowSubmitModal(true)}
            >
              <MessageSquarePlus size={16} />
              <span>Share Your Dream Vision</span>
            </button>
          </div>
        </div>

        {/* Ideas Cards Grid */}
        <div className="ideas-cards-grid reveal-item">
          {filteredIdeas.length === 0 ? (
            <div className="ideas-empty-state">
              <Compass size={36} className="empty-icon" />
              <h4>No matching dream visions found</h4>
              <p>Be the first to share an idea for this category or search term!</p>
              <button
                type="button"
                className="share-vision-btn primary"
                onClick={() => setShowSubmitModal(true)}
              >
                <MessageSquarePlus size={16} />
                <span>Share Your Dream Idea Now</span>
              </button>
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <div key={idea.id} className="idea-card">
                {/* Header info */}
                <div className="idea-card-header">
                  <div className="user-avatar-group">
                    <div className="avatar-circle">
                      {idea.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <span className="user-name">{idea.name}</span>
                      <span className="user-location">
                        <MapPin size={11} /> {idea.location} • <span className="time-text">{idea.date}</span>
                      </span>
                    </div>
                  </div>

                  <span className="room-type-badge">{idea.roomType}</span>
                </div>

                {/* Aesthetic Tag */}
                <div className="style-chip-row">
                  <span className="style-chip">
                    <Tag size={11} /> Style: <strong>{idea.style}</strong>
                  </span>
                </div>

                {/* Vision Content Prompt */}
                <div className="vision-quote-box">
                  <p className="vision-quote-text">&ldquo;{idea.vision}&rdquo;</p>
                </div>

                {/* Footer Interaction Bar */}
                <div className="idea-card-footer">
                  <button
                    type="button"
                    className={`like-count-btn ${idea.isUserLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(idea.id)}
                  >
                    <Heart size={14} className="heart-icon" />
                    <span>{idea.likes} Inspired</span>
                  </button>

                  <a href="#ai-styling" className="try-in-ai-btn">
                    <Wand2 size={13} />
                    <span>Try in AI Visualizer</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Share Your Dream House Vision Form */}
        {showSubmitModal && (
          <div className="idea-modal-overlay" onClick={() => setShowSubmitModal(false)}>
            <div className="idea-modal-card" onClick={(e) => e.stopPropagation()}>
              {isSubmittedSuccess ? (
                <div className="modal-success-state">
                  <CheckCircle2 size={46} className="success-check" />
                  <h3>Dream Vision Shared! 🚀</h3>
                  <p>Your idea has been published to the community wall. Thank you for inspiring fellow home builders across India!</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="idea-submit-form">
                  <div className="modal-form-header">
                    <div className="modal-badge">
                      <Sparkles size={13} />
                      <span>INSPIRE THE COMMUNITY</span>
                    </div>
                    <h3>Share Your Dream House Idea</h3>
                    <p>What idea or design concept do you have in mind when building your dream home?</p>
                  </div>

                  <div className="form-fields-grid">
                    <div>
                      <label className="form-field-label">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ananya &amp; Rohan"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="form-text-input"
                      />
                    </div>

                    <div>
                      <label className="form-field-label">Location (City, State)</label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai, MH"
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        className="form-text-input"
                      />
                    </div>

                    <div>
                      <label className="form-field-label">Target Room / Area</label>
                      <select
                        value={userRoomType}
                        onChange={(e) => setUserRoomType(e.target.value)}
                        className="form-select-input"
                      >
                        <option value="Modular Kitchen">Modular Kitchen</option>
                        <option value="Master Bedroom">Master Bedroom</option>
                        <option value="Living &amp; Dining">Living &amp; Dining</option>
                        <option value="Pooja &amp; Mandir">Pooja &amp; Mandir</option>
                        <option value="Home Office">Home Office</option>
                        <option value="Balcony &amp; Terrace">Balcony &amp; Terrace</option>
                        <option value="Full House Architecture">Full House Architecture</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-field-label">Preferred Aesthetic / Style</label>
                      <select
                        value={userStyle}
                        onChange={(e) => setUserStyle(e.target.value)}
                        className="form-select-input"
                      >
                        <option value="Modern Minimalist">Modern Minimalist</option>
                        <option value="Warm Teak &amp; Marble">Warm Teak &amp; Marble</option>
                        <option value="Scandinavian Light">Scandinavian Light</option>
                        <option value="Heritage Brass &amp; Stone">Heritage Brass &amp; Stone</option>
                        <option value="Luxury Contemporary">Luxury Contemporary</option>
                        <option value="Biophilic Greenery">Biophilic Greenery</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-field-label">Describe Your Dream House Vision *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="e.g. I want an open-plan kitchen with warm teak cabinetry, white quartz island counter, ambient backlight, and a hidden utility pantry..."
                      value={userVision}
                      onChange={(e) => setUserVision(e.target.value)}
                      className="form-textarea-input"
                    />
                  </div>

                  <div className="modal-form-actions">
                    <button
                      type="button"
                      className="modal-cancel-btn"
                      onClick={() => setShowSubmitModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="modal-submit-btn">
                      <Send size={15} />
                      <span>Publish Vision to Community</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
