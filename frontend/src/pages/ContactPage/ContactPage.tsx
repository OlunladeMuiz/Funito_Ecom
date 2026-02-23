import { useState } from "react";
import { PageBanner } from "../../components";
import "./ContactPage.css";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send message.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <PageBanner title="Contact Us" breadcrumbs={[{ label: "Contact" }]} />

      <div className="container">
        <div className="contact-layout">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>
              Have a question or need assistance? We're here to help! Reach out
              to us through any of the channels below.
            </p>

            <div className="info-items">
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div>
                  <h4>Address</h4>
                  <p>400 University Drive Suite 200<br />Coral Gables, FL 33134 USA</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">📞</span>
                <div>
                  <h4>Phone</h4>
                  <p>+1 (305) 555-0123</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">✉️</span>
                <div>
                  <h4>Email</h4>
                  <p>support@furniro.com</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">🕐</span>
                <div>
                  <h4>Working Hours</h4>
                  <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            {error && (
              <div className="error-message" style={{ color: 'red', marginBottom: 12 }}>{error}</div>
            )}
            {submitted ? (
              <div className="success-message">
                <span className="success-icon">✓</span>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)}>Send Another</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What's this about?"
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Your message..."
                    rows={5}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
