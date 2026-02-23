import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts, useCategories } from "../../api/hooks";
import { ProductCard, PageBanner, Loading } from "../../components";
import "./ShopPage.css";

// Mock products for fallback when API is unavailable
const mockProducts = [
  { id: "f0000000-0000-4000-8000-000000000001", name: "Syltherine", slug: "syltherine", description: "Stylish cafe chair", price: 2500000, originalPrice: 3500000, stock: 10, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000001", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000001", productId: "f0000000-0000-4000-8000-000000000001", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000001", name: "Dining", slug: "dining", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000002", name: "Leviosa", slug: "leviosa", description: "Stylish cafe chair", price: 2500000, originalPrice: null, stock: 10, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000001", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000002", productId: "f0000000-0000-4000-8000-000000000002", url: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000001", name: "Dining", slug: "dining", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000003", name: "Lolito", slug: "lolito", description: "Luxury big sofa", price: 7000000, originalPrice: 14000000, stock: 5, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000002", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000003", productId: "f0000000-0000-4000-8000-000000000003", url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000002", name: "Living", slug: "living", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000004", name: "Respira", slug: "respira", description: "Outdoor bar table and stool", price: 500000, originalPrice: null, stock: 15, isActive: true, isNew: true, categoryId: "f0000000-0000-4000-8000-000000000001", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000004", productId: "f0000000-0000-4000-8000-000000000004", url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000001", name: "Dining", slug: "dining", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000005", name: "Grifo", slug: "grifo", description: "Night lamp", price: 1500000, originalPrice: null, stock: 20, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000003", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000005", productId: "f0000000-0000-4000-8000-000000000005", url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000003", name: "Bedroom", slug: "bedroom", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000006", name: "Muggo", slug: "muggo", description: "Small mug", price: 150000, originalPrice: null, stock: 50, isActive: true, isNew: true, categoryId: "f0000000-0000-4000-8000-000000000001", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000006", productId: "f0000000-0000-4000-8000-000000000006", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000001", name: "Dining", slug: "dining", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000007", name: "Pingky", slug: "pingky", description: "Cute bed set", price: 7000000, originalPrice: 14000000, stock: 3, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000003", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000007", productId: "f0000000-0000-4000-8000-000000000007", url: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000003", name: "Bedroom", slug: "bedroom", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000008", name: "Potty", slug: "potty", description: "Minimalist flower pot", price: 500000, originalPrice: null, stock: 25, isActive: true, isNew: true, categoryId: "f0000000-0000-4000-8000-000000000002", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000008", productId: "f0000000-0000-4000-8000-000000000008", url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000002", name: "Living", slug: "living", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000009", name: "Oslo Armchair", slug: "oslo-armchair", description: "Scandinavian design armchair", price: 4500000, originalPrice: 5500000, stock: 8, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000002", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000009", productId: "f0000000-0000-4000-8000-000000000009", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000002", name: "Living", slug: "living", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000010", name: "Bergen Dining Table", slug: "bergen-dining-table", description: "Solid oak dining table", price: 12000000, originalPrice: null, stock: 4, isActive: true, isNew: true, categoryId: "f0000000-0000-4000-8000-000000000001", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000010", productId: "f0000000-0000-4000-8000-000000000010", url: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000001", name: "Dining", slug: "dining", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000011", name: "Napoli Bookshelf", slug: "napoli-bookshelf", description: "Modern 5-tier bookshelf", price: 3200000, originalPrice: 4000000, stock: 12, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000002", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000011", productId: "f0000000-0000-4000-8000-000000000011", url: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000002", name: "Living", slug: "living", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000012", name: "Luna Queen Bed", slug: "luna-queen-bed", description: "Upholstered queen bed frame", price: 8500000, originalPrice: null, stock: 6, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000003", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000012", productId: "f0000000-0000-4000-8000-000000000012", url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000003", name: "Bedroom", slug: "bedroom", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000013", name: "Kyoto Coffee Table", slug: "kyoto-coffee-table", description: "Japanese-inspired coffee table", price: 2800000, originalPrice: null, stock: 15, isActive: true, isNew: true, categoryId: "f0000000-0000-4000-8000-000000000002", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000013", productId: "f0000000-0000-4000-8000-000000000013", url: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000002", name: "Living", slug: "living", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000014", name: "Milano Dining Chair", slug: "milano-dining-chair", description: "Set of 2 velvet dining chairs", price: 1800000, originalPrice: 2200000, stock: 20, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000001", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000014", productId: "f0000000-0000-4000-8000-000000000014", url: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000001", name: "Dining", slug: "dining", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000015", name: "Nordic TV Stand", slug: "nordic-tv-stand", description: "Minimalist TV console", price: 3500000, originalPrice: null, stock: 9, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000002", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000015", productId: "f0000000-0000-4000-8000-000000000015", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000002", name: "Living", slug: "living", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000016", name: "Verona Wardrobe", slug: "verona-wardrobe", description: "3-door wooden wardrobe", price: 9500000, originalPrice: 11000000, stock: 3, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000003", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000016", productId: "f0000000-0000-4000-8000-000000000016", url: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000003", name: "Bedroom", slug: "bedroom", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000017", name: "Zen Floor Lamp", slug: "zen-floor-lamp", description: "Bamboo floor lamp", price: 1200000, originalPrice: null, stock: 25, isActive: true, isNew: true, categoryId: "f0000000-0000-4000-8000-000000000002", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000017", productId: "f0000000-0000-4000-8000-000000000017", url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000002", name: "Living", slug: "living", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000018", name: "Paris Side Table", slug: "paris-side-table", description: "Gold accent side table", price: 950000, originalPrice: null, stock: 30, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000002", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000018", productId: "f0000000-0000-4000-8000-000000000018", url: "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000002", name: "Living", slug: "living", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000019", name: "Stockholm Dresser", slug: "stockholm-dresser", description: "6-drawer bedroom dresser", price: 6500000, originalPrice: 7500000, stock: 5, isActive: true, categoryId: "f0000000-0000-4000-8000-000000000003", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000019", productId: "f0000000-0000-4000-8000-000000000019", url: "https://images.unsplash.com/photo-1551298370-9d3d53fjkd23?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000003", name: "Bedroom", slug: "bedroom", createdAt: "", updatedAt: "" } },
  { id: "f0000000-0000-4000-8000-000000000020", name: "Venice Mirror", slug: "venice-mirror", description: "Large decorative wall mirror", price: 2200000, originalPrice: null, stock: 18, isActive: true, isNew: true, categoryId: "f0000000-0000-4000-8000-000000000003", createdAt: "", updatedAt: "", images: [{ id: "f0000000-0000-4000-8000-000000000020", productId: "f0000000-0000-4000-8000-000000000020", url: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400", sortOrder: 0 }], category: { id: "f0000000-0000-4000-8000-000000000003", name: "Bedroom", slug: "bedroom", createdAt: "", updatedAt: "" } },
];

const mockCategories = [
  { id: "f0000000-0000-4000-8000-000000000001", name: "Dining", slug: "dining", createdAt: "", updatedAt: "" },
  { id: "f0000000-0000-4000-8000-000000000002", name: "Living", slug: "living", createdAt: "", updatedAt: "" },
  { id: "f0000000-0000-4000-8000-000000000003", name: "Bedroom", slug: "bedroom", createdAt: "", updatedAt: "" },
];

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [priceRange, setPriceRange] = useState({
    min: Number(searchParams.get("min")) || 0,
    max: Number(searchParams.get("max")) || 0,
  });

  const { products, loading, error } = useProducts({
    search: search || undefined,
    category: selectedCategory || undefined,
    min: priceRange.min || undefined,
    max: priceRange.max || undefined,
  });

  const { categories } = useCategories();

  // Use mock data as fallback when API returns empty
  const displayProducts = products.length > 0 ? products : mockProducts;
  const displayCategories = categories.length > 0 ? categories : mockCategories;

  // Filter mock products client-side when using fallback
  const filteredProducts = products.length > 0 
    ? displayProducts 
    : displayProducts.filter(p => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (selectedCategory && p.category?.slug !== selectedCategory) return false;
        if (priceRange.min && p.price < priceRange.min) return false;
        if (priceRange.max && p.price > priceRange.max) return false;
        return true;
      });

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    if (priceRange.min) params.set("min", String(priceRange.min));
    if (priceRange.max) params.set("max", String(priceRange.max));
    setSearchParams(params);
  }, [search, selectedCategory, priceRange, setSearchParams]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setPriceRange({ min: 0, max: 0 });
  };

  const hasFilters = search || selectedCategory || priceRange.min || priceRange.max;

  return (
    <div className="shop-page">
      <PageBanner 
        title="Shop" 
        breadcrumbs={[{ label: "Shop" }]} 
      />

      <div className="container">
        <div className="shop-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filter-header">
              <h3>Filters</h3>
              {hasFilters && (
                <button className="clear-filters" onClick={clearFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* Search */}
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="filter-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {displayCategories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min || ""}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, min: Number(e.target.value) }))
                  }
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max || ""}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, max: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="products-main">
            <div className="products-header">
              <p className="results-count">
                Showing {filteredProducts.length} results
                {hasFilters && " (filtered)"}
              </p>
            </div>

            {loading ? (
              <Loading fullPage />
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-products">
                <p>No products found</p>
                {hasFilters && (
                  <button className="outline-btn" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
