import { PageBanner } from "../../components";
import "./AboutPage.css";

export function AboutPage() {
  return (
    <div className="about-page">
      <PageBanner title="About Us" breadcrumbs={[{ label: "About" }]} />

      <div className="container">
        <section className="about-section">
          <div className="about-content">
            <h2>Our Story</h2>
            <p>
              Furniro was founded with a simple mission: to bring beautiful,
              high-quality furniture to everyone. We believe that great design
              should be accessible, and that your home should be a reflection of
              your personal style.
            </p>
            <p>
              Since 2020, we've been crafting and curating furniture pieces that
              combine timeless elegance with modern functionality. Our team of
              designers and craftsmen work tirelessly to ensure every piece
              meets our exacting standards.
            </p>
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"
              alt="Furniro showroom"
            />
          </div>
        </section>

        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <span className="value-icon">✦</span>
              <h3>Quality</h3>
              <p>We use only the finest materials and craftsmanship in every piece.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">♻</span>
              <h3>Sustainability</h3>
              <p>Committed to eco-friendly practices and sustainable sourcing.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">♥</span>
              <h3>Customer First</h3>
              <p>Your satisfaction is our top priority, always.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">✎</span>
              <h3>Design</h3>
              <p>Timeless aesthetics that complement any space.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
