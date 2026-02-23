import { Link } from "react-router-dom";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>Furniro.</h3>
          <p>
            400 University Drive Suite 200 Coral Gables,
            <br />
            FL 33134 USA
          </p>
        </div>

        <div className="footer-col">
          <h4>Links</h4>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-col">
          <h4>Help</h4>
          <Link to="/payment">Payment Options</Link>
          <Link to="/returns">Returns</Link>
          <Link to="/privacy">Privacy Policies</Link>
        </div>

        <div className="footer-col">
          <h4>Newsletter</h4>
          <form className="newsletter" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter Your Email Address" />
            <button type="submit" className="link-btn">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>&copy; 2026 Furniro. All rights reserved.</p>
      </div>
    </footer>
  );
}
