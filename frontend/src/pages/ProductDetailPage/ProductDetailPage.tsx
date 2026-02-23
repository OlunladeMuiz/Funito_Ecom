import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct, useProductReviews } from "../../api/hooks";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { formatPrice } from "../../utils/format";
import { PageBanner, Loading } from "../../components";
import "./ProductDetailPage.css";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id!);
  const { reviews, averageRating, totalReviews, submitReview, loading: reviewsLoading } = useProductReviews(id!);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Loading fullPage />;
  if (error || !product) {
    return (
      <div className="container">
        <div className="error-state">
          <h2>Product Not Found</h2>
          <p>{error || "This product doesn't exist."}</p>
          <Link to="/shop" className="primary-btn">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    await addItem(product.id, quantity);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    setSubmitting(true);
    try {
      await submitReview(reviewForm.rating, reviewForm.comment || undefined);
      setReviewForm({ rating: 5, comment: "" });
    } finally {
      setSubmitting(false);
    }
  };

  const images = product.images.length > 0 
    ? product.images 
    : [{ id: "placeholder", url: "https://via.placeholder.com/600", sortOrder: 0, productId: product.id }];

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="product-detail-page">
      <PageBanner 
        title={product.name}
        breadcrumbs={[
          { label: "Shop", href: "/shop" },
          { label: product.name }
        ]}
      />

      <div className="container">
        <div className="product-detail">
          {/* Images Section */}
          <div className="product-images">
            <div className="main-image">
              <img src={images[selectedImage].url} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    className={`thumbnail ${index === selectedImage ? "active" : ""}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img.url} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="product-info">
            <h1>{product.name}</h1>
            
            <div className="price-section">
              <span className="current-price">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className="original-price">{formatPrice(product.originalPrice!)}</span>
              )}
            </div>

            {totalReviews > 0 && (
              <div className="rating-summary">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= Math.round(averageRating) ? "filled" : ""}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="review-count">{totalReviews} Customer Review{totalReviews !== 1 && "s"}</span>
              </div>
            )}

            <p className="description">{product.description || "No description available."}</p>

            {product.category && (
              <div className="category-badge">
                <span>Category:</span>
                <Link to={`/shop?category=${product.category.slug}`}>
                  {product.category.name}
                </Link>
              </div>
            )}

            <div className="stock-status">
              {product.stock > 0 ? (
                <span className="in-stock">In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  Add To Cart
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="product-tabs">
          <div className="tabs-header">
            <button
              className={activeTab === "description" ? "active" : ""}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={activeTab === "reviews" ? "active" : ""}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({totalReviews})
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === "description" && (
              <div className="description-tab">
                <p>{product.description || "No detailed description available for this product."}</p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="reviews-tab">
                {isAuthenticated && (
                  <form className="review-form" onSubmit={handleSubmitReview}>
                    <h4>Write a Review</h4>
                    <div className="rating-input">
                      <label>Rating:</label>
                      <div className="star-select">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={star <= reviewForm.rating ? "filled" : ""}
                            onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      placeholder="Write your review..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                      rows={4}
                    />
                    <button type="submit" className="submit-review-btn" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                )}

                {reviewsLoading ? (
                  <Loading />
                ) : reviews.length === 0 ? (
                  <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <span className="reviewer-name">{review.user.name || "Anonymous"}</span>
                          <div className="review-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= review.rating ? "filled" : ""}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="review-comment">{review.comment || "No comment provided."}</p>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
