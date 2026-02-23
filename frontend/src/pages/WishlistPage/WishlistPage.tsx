import { Link } from "react-router-dom";
import { useWishlist } from "../../api/hooks";
import { useCart } from "../../contexts/CartContext";
import { wishlistApi } from "../../api";
import { PageBanner, Loading } from "../../components";
import "./WishlistPage.css";

export function WishlistPage() {
  const { items, loading, refetch } = useWishlist();
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleRemove = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addItem(productId, 1);
      await handleRemove(productId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <PageBanner title="My Wishlist" breadcrumbs={[{ label: "Wishlist" }]} />
        <div className="container">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <PageBanner title="My Wishlist" breadcrumbs={[{ label: "Wishlist" }]} />

      <div className="container">
        {items.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">♡</div>
            <h3>Your wishlist is empty</h3>
            <p>Start adding items you love to your wishlist</p>
            <Link to="/shop" className="shop-link">
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            <div className="wishlist-header">
              <p>{items.length} item{items.length !== 1 ? "s" : ""} in your wishlist</p>
            </div>
            <div className="wishlist-grid">
              {items.map((item) => (
                <div key={item.id} className="wishlist-item">
                  <Link to={`/product/${item.productId}`} className="item-image">
                    <img
                      src={item.product.images?.[0]?.url || "https://via.placeholder.com/200"}
                      alt={item.product.name}
                    />
                  </Link>
                  <div className="item-content">
                    <Link to={`/product/${item.productId}`} className="item-name">
                      {item.product.name}
                    </Link>
                    <span className="item-category">{item.product.category?.name}</span>
                    <span className="item-price">{formatPrice(item.product.price)}</span>
                  </div>
                  <div className="item-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(item.productId)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
