import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./SignupPage.css";

function SignupPage() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    // Gmail validation
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(formData.email)) {
      setError("Please use a valid Gmail address (example@gmail.com)");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.name);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p className="auth-subtitle">Join us and start shopping</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">{error}</div>
            )}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  style={{ position: "absolute", right: 8, top: 8, background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", padding: 0 }}
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye-slash SVG
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5.05 0-9.29-3.16-11-8 1.21-3.06 3.6-5.64 6.58-7.06M1 1l22 22" /><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.93 0 3.5-1.57 3.5-3.5 0-.47-.09-.92-.26-1.33" /></svg>
                  ) : (
                    // Eye SVG
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="10" ry="6" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  style={{ position: "absolute", right: 8, top: 8, background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to the <a href="/terms">Terms of Service</a> and{" "}
                <a href="/privacy">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <div className="auth-image">
          <img
            src="https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800"
            alt="Modern living room"
          />
          <div className="image-overlay">
            <h2>Furniro</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
