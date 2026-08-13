import { BadgeCheck, Quote, Sparkles, Star } from 'lucide-react';

const reviews = [
  {
    name: 'Aarav Mehta',
    location: 'Gurugram',
    project: 'Premium Apartment Renovation',
    text: 'The team understood our lifestyle before suggesting materials. The final home feels calm, premium, and very practical for everyday family use.',
    rating: 5,
  },
  {
    name: 'Isha Rao',
    location: 'Bengaluru',
    project: 'Modular Kitchen & Living Room',
    text: 'Their visual planning made decisions easy. We could see the palette, storage flow, lighting, and budget direction before execution started.',
    rating: 5,
  },
  {
    name: 'Rohan Kapoor',
    location: 'Mumbai',
    project: 'Luxury Bedroom Suite',
    text: 'Very polished process from consultation to final design. The space looks elegant, but still feels warm and comfortable.',
    rating: 5,
  },
  {
    name: 'Naina Sethi',
    location: 'Delhi',
    project: 'Home Office Transformation',
    text: 'They balanced function and aesthetics beautifully. The new workspace feels focused, organized, and quietly premium.',
    rating: 5,
  },
];

export default function ReviewsPanel() {
  const marqueeReviews = [...reviews, ...reviews];

  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-bg-line" aria-hidden="true" />

      <div className="reviews-shell">
        <div className="reviews-header reveal-item">
          <div className="reviews-badge-pill">
            <BadgeCheck size={15} className="reviews-badge-icon" />
            <span>CLIENT REVIEWS</span>
            <span className="reviews-live-dot" />
          </div>

          <div className="reviews-heading-row">
            <div>
              <div className="reviews-subtitle-text">TRUSTED BY HOMEOWNERS</div>
              <h2 className="reviews-main-title">
                Designed Spaces, Remembered Experiences
              </h2>
            </div>

            <div className="reviews-score-card" aria-label="Average client rating">
              <div className="reviews-score-stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} fill="currentColor" />
                ))}
              </div>
              <strong>4.9/5</strong>
              <span>Average client rating</span>
            </div>
          </div>
        </div>

        <div className="reviews-stage reveal-item">
          <div className="reviews-feature-card">
            <Quote size={28} className="reviews-quote-icon" />
            <p>
              Professional design guidance, realistic visual previews, and refined material choices that help every room feel connected to the way you live.
            </p>
            <div className="reviews-feature-footer">
              <span>90+ completed spaces</span>
              <span>15+ years expertise</span>
            </div>
          </div>

          <div className="reviews-marquee" aria-label="Client testimonials">
            <div className="reviews-marquee-track">
              {marqueeReviews.map((review, index) => (
                <article className="review-card" key={`${review.name}-${index}`}>
                  <div className="review-card-top">
                    <div className="review-avatar">{review.name.charAt(0)}</div>
                    <div>
                      <h3>{review.name}</h3>
                      <span>{review.location}</span>
                    </div>
                  </div>

                  <div className="review-rating">
                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                      <Star key={starIndex} size={14} fill="currentColor" />
                    ))}
                  </div>

                  <p>{review.text}</p>

                  <div className="review-project">
                    <Sparkles size={13} />
                    <span>{review.project}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
