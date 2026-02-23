import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { formatPrice } from "../../utils/format";
import { wishlistApi } from "../../api";
import type { Product } from "../../api/types";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product & { isNew?: boolean };
}

const PRODUCT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80";

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const imageUrl = product.images[0]?.url || PRODUCT_FALLBACK_IMAGE;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;
  const isNew = (product as { isNew?: boolean }).isNew;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product.id, 1, {
      name: product.name,
      price: product.price,
      image: imageUrl,
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description || '',
        url: window.location.origin + `/product/${product.id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/product/${product.id}`);
      alert('Link copied to clipboard!');
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Store in localStorage for comparison
    const compareList = JSON.parse(localStorage.getItem('compareProducts') || '[]');
    if (!compareList.includes(product.id)) {
      compareList.push(product.id);
      localStorage.setItem('compareProducts', JSON.stringify(compareList));
      alert(`${product.name} added to compare list!`);
    } else {
      alert('Product already in compare list!');
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await wishlistApi.add(product.id);
      alert(`${product.name} added to your wishlist!`);
      // Optionally, trigger a refetch or update UI state here
    } catch (err) {
      alert("Failed to add to wishlist. Are you logged in?");
    }
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          <img
            src={imageUrl}
            alt={product.name}
            onError={(event) => {
              const target = event.currentTarget;
              if (target.dataset.fallbackApplied === "true") {
                return;
              }
              target.dataset.fallbackApplied = "true";
              target.src = PRODUCT_FALLBACK_IMAGE;
            }}
          />
          {hasDiscount && <span className="badge discount">-{discountPercent}%</span>}
          {!hasDiscount && isNew && <span className="badge new">New</span>}
          {product.stock < 5 && product.stock > 0 && (
            <span className="badge low-stock">Low Stock</span>
          )}
          {product.stock === 0 && <span className="badge out-of-stock">Out of Stock</span>}
          
          <div className="product-overlay">
            <button 
              className="add-to-cart-btn" 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to cart"}
            </button>
            <div className="overlay-links">
              <span onClick={handleShare}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> Share</span>
              <span onClick={handleCompare}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg> Compare</span>
              <span onClick={handleLike}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Like</span>
            </div>
          </div>
        </div>
        
        <div className="product-info">
          <h4>{product.name}</h4>
          <p className="product-desc">{product.description || product.category?.name}</p>
          <div className="price-row">
            <span className="price">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="old-price">{formatPrice(product.originalPrice!)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
