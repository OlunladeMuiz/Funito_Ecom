import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { PageBanner, Loading } from "../../components";
import "./CartPage.css";

export function CartPage() {
  const { cart, loading, itemCount, total, updateItem, removeItem } = useCart();
  const { isAuthenticated } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) return <Loading fullPage />;

  return (
    <div className="cart-page">
      <PageBanner title="Cart" breadcrumbs={[{ label: "Cart" }]} />

      <div className="container">
        {!cart || cart.items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/shop" className="primary-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => {
                    const product = item.product;
                    const imageUrl = product?.images?.[0]?.url || "https://via.placeholder.com/80";
                    const productName = product?.name || "Product";
                    
                    return (
                      <tr key={item.id}>
                        <td className="product-cell">
                          <Link to={`/products/${item.productId}`} className="product-link">
                            <img
                              src={imageUrl}
                              alt={productName}
                            />
                            <span className="product-name">{productName}</span>
                          </Link>
                        </td>
                        <td className="price-cell">{formatPrice(item.unitPrice)}</td>
                        <td className="quantity-cell">
                          <div className="quantity-control">
                            <button onClick={() => updateItem(item.id, item.quantity - 1)}>
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateItem(item.id, item.quantity + 1)}>
                              +
                            </button>
                          </div>
                        </td>
                        <td className="subtotal-cell">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </td>
                        <td className="remove-cell">
                          <button
                            className="remove-btn"
                            onClick={() => removeItem(item.id)}
                            aria-label="Remove item"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="cart-summary">
              <h3>Cart Total</h3>
              <div className="summary-row">
                <span>Items</span>
                <span>{itemCount}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {isAuthenticated ? (
                <Link to="/checkout" className="checkout-btn">
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="login-prompt">
                  <p>Please log in to checkout</p>
                  <Link to="/login" state={{ from: { pathname: "/checkout" } }} className="checkout-btn">
                    Login to Checkout
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
