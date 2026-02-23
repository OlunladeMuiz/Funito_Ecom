import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import "./Header.css";

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">◬</span>
          <span className="brand-name">Furniro</span>
        </Link>

        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="header-icons">
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="icon-btn" aria-label="Account">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <div className="user-dropdown">
                <span className="user-email">{user?.email}</span>
                <Link to="/profile">Profile</Link>
                <Link to="/orders">My Orders</Link>
                {isAdmin && <Link to="/admin">Admin Panel</Link>}
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="icon-btn" aria-label="Login">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"
                  fill="currentColor"
                />
              </svg>
            </Link>
          )}

          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 20.2 4.6 12.9a4.6 4.6 0 0 1 6.5-6.5L12 7.3l.9-.9a4.6 4.6 0 0 1 6.5 6.5Z"
                fill="currentColor"
              />
            </svg>
          </Link>

          <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 6h13l-1.5 7.5a2 2 0 0 1-2 1.5H9.2a2 2 0 0 1-2-1.6L5.1 4H2V2h3a2 2 0 0 1 2 1.6Zm2.2 15a1.6 1.6 0 1 0-1.6-1.6A1.6 1.6 0 0 0 9.2 21Zm8 0a1.6 1.6 0 1 0-1.6-1.6A1.6 1.6 0 0 0 17.2 21Z"
                fill="currentColor"
              />
            </svg>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
