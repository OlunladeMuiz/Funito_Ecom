import { Link } from "react-router-dom";
import { useProducts, useCategories } from "../../api/hooks";
import { ProductCard, Loading } from "../../components";
import "./HomePage.css";

const RANGE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80";

// Mock categories for fallback
const mockCategories = [
  { id: "f0000000-0000-4000-8000-000000000001", name: "Dining", slug: "dining" },
  { id: "f0000000-0000-4000-8000-000000000002", name: "Living", slug: "living" },
  { id: "f0000000-0000-4000-8000-000000000003", name: "Bedroom", slug: "bedroom" },
];

// Mock products for fallback
const mockProducts = [
  {
    id: "f0000000-0000-4000-8000-000000000001",
    name: "Syltherine",
    slug: "syltherine",
    description: "Stylish cafe chair",
    price: 2500000,
    originalPrice: 3500000,
    stock: 10,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000001",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000001", productId: "f0000000-0000-4000-8000-000000000001", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000002",
    name: "Leviosa",
    slug: "leviosa",
    description: "Stylish cafe chair",
    price: 2500000,
    originalPrice: null,
    stock: 10,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000001",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000002", productId: "f0000000-0000-4000-8000-000000000002", url: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000003",
    name: "Lolito",
    slug: "lolito",
    description: "Luxury big sofa",
    price: 7000000,
    originalPrice: 14000000,
    stock: 5,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000002",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000003", productId: "f0000000-0000-4000-8000-000000000003", url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000004",
    name: "Respira",
    slug: "respira",
    description: "Outdoor bar table and stool",
    price: 500000,
    originalPrice: null,
    stock: 15,
    isActive: true,
    isNew: true,
    categoryId: "f0000000-0000-4000-8000-000000000001",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000004", productId: "f0000000-0000-4000-8000-000000000004", url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000005",
    name: "Grifo",
    slug: "grifo",
    description: "Night lamp",
    price: 1500000,
    originalPrice: null,
    stock: 20,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000003",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000005", productId: "f0000000-0000-4000-8000-000000000005", url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000006",
    name: "Muggo",
    slug: "muggo",
    description: "Small mug",
    price: 150000,
    originalPrice: null,
    stock: 50,
    isActive: true,
    isNew: true,
    categoryId: "f0000000-0000-4000-8000-000000000001",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000006", productId: "f0000000-0000-4000-8000-000000000006", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000007",
    name: "Pingky",
    slug: "pingky",
    description: "Cute bed set",
    price: 7000000,
    originalPrice: 14000000,
    stock: 3,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000003",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000007", productId: "f0000000-0000-4000-8000-000000000007", url: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000008",
    name: "Potty",
    slug: "potty",
    description: "Minimalist flower pot",
    price: 500000,
    originalPrice: null,
    stock: 25,
    isActive: true,
    isNew: true,
    categoryId: "f0000000-0000-4000-8000-000000000002",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000008", productId: "f0000000-0000-4000-8000-000000000008", url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000009",
    name: "Oslo Armchair",
    slug: "oslo-armchair",
    description: "Scandinavian design armchair",
    price: 4500000,
    originalPrice: 5500000,
    stock: 8,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000002",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000009", productId: "f0000000-0000-4000-8000-000000000009", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000010",
    name: "Bergen Dining Table",
    slug: "bergen-dining-table",
    description: "Solid oak dining table",
    price: 12000000,
    originalPrice: null,
    stock: 4,
    isActive: true,
    isNew: true,
    categoryId: "f0000000-0000-4000-8000-000000000001",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000010", productId: "f0000000-0000-4000-8000-000000000010", url: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000011",
    name: "Napoli Bookshelf",
    slug: "napoli-bookshelf",
    description: "Modern 5-tier bookshelf",
    price: 3200000,
    originalPrice: 4000000,
    stock: 12,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000002",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000011", productId: "f0000000-0000-4000-8000-000000000011", url: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000012",
    name: "Luna Queen Bed",
    slug: "luna-queen-bed",
    description: "Upholstered queen bed frame",
    price: 8500000,
    originalPrice: null,
    stock: 6,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000003",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000012", productId: "f0000000-0000-4000-8000-000000000012", url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000013",
    name: "Kyoto Coffee Table",
    slug: "kyoto-coffee-table",
    description: "Japanese-inspired coffee table",
    price: 2800000,
    originalPrice: null,
    stock: 15,
    isActive: true,
    isNew: true,
    categoryId: "f0000000-0000-4000-8000-000000000002",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000013", productId: "f0000000-0000-4000-8000-000000000013", url: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000014",
    name: "Milano Dining Chair",
    slug: "milano-dining-chair",
    description: "Set of 2 velvet dining chairs",
    price: 1800000,
    originalPrice: 2200000,
    stock: 20,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000001",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000014", productId: "f0000000-0000-4000-8000-000000000014", url: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000015",
    name: "Nordic TV Stand",
    slug: "nordic-tv-stand",
    description: "Minimalist TV console",
    price: 3500000,
    originalPrice: null,
    stock: 9,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000002",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000015", productId: "f0000000-0000-4000-8000-000000000015", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000016",
    name: "Verona Wardrobe",
    slug: "verona-wardrobe",
    description: "3-door wooden wardrobe",
    price: 9500000,
    originalPrice: 11000000,
    stock: 3,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000003",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000016", productId: "f0000000-0000-4000-8000-000000000016", url: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000017",
    name: "Zen Floor Lamp",
    slug: "zen-floor-lamp",
    description: "Bamboo floor lamp",
    price: 1200000,
    originalPrice: null,
    stock: 25,
    isActive: true,
    isNew: true,
    categoryId: "f0000000-0000-4000-8000-000000000002",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000017", productId: "f0000000-0000-4000-8000-000000000017", url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000018",
    name: "Paris Side Table",
    slug: "paris-side-table",
    description: "Gold accent side table",
    price: 950000,
    originalPrice: null,
    stock: 30,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000002",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000018", productId: "f0000000-0000-4000-8000-000000000018", url: "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000019",
    name: "Stockholm Dresser",
    slug: "stockholm-dresser",
    description: "6-drawer bedroom dresser",
    price: 6500000,
    originalPrice: 7500000,
    stock: 5,
    isActive: true,
    categoryId: "f0000000-0000-4000-8000-000000000003",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000019", productId: "f0000000-0000-4000-8000-000000000019", url: "https://images.unsplash.com/photo-1551298370-9d3d53fjkd23?w=400", sortOrder: 0 }],
    category: null,
  },
  {
    id: "f0000000-0000-4000-8000-000000000020",
    name: "Venice Mirror",
    slug: "venice-mirror",
    description: "Large decorative wall mirror",
    price: 2200000,
    originalPrice: null,
    stock: 18,
    isActive: true,
    isNew: true,
    categoryId: "f0000000-0000-4000-8000-000000000003",
    createdAt: "",
    updatedAt: "",
    images: [{ id: "f0000000-0000-4000-8000-000000000020", productId: "f0000000-0000-4000-8000-000000000020", url: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400", sortOrder: 0 }],
    category: null,
  },
];

export function HomePage() {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  // Use mock data as fallback when API returns empty
  const displayCategories = categories.length > 0 ? categories : mockCategories;
  const displayProducts = products.length > 0 ? products : mockProducts;
  const featuredProducts = displayProducts.slice(0, 8);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
              alt="Modern room"
            />
          </div>
          <div className="hero-card">
            <span className="eyebrow">New Arrival</span>
            <h1>Discover Our New Collection</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
              tellus, luctus nec ullamcorper mattis.
            </p>
            <Link to="/shop" className="primary-btn">Buy Now</Link>
          </div>
        </div>
      </section>

      {/* Browse The Range */}
      <section className="range">
        <div className="container">
          <div className="section-head">
            <h2>Browse The Range</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          
          {categoriesLoading ? (
            <Loading />
          ) : (
            <div className="range-grid">
              {displayCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug}`}
                  className="range-card"
                >
                  <img
                    src={getCategoryImage(category.slug)}
                    alt={category.name}
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.dataset.fallbackApplied === "true") {
                        return;
                      }
                      target.dataset.fallbackApplied = "true";
                      target.src = RANGE_FALLBACK_IMAGE;
                    }}
                  />
                  <h3>{category.name}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Our Products */}
      <section className="products">
        <div className="container">
          <div className="section-head">
            <h2>Our Products</h2>
          </div>
          
          {productsLoading ? (
            <Loading />
          ) : (
            <>
              <div className="product-grid">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="center-btn">
                <Link to="/shop" className="outline-btn">Show More</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="inspiration">
        <div className="container inspiration-inner">
          <div className="inspiration-text">
            <h2>50+ Beautiful rooms inspiration</h2>
            <p>
              Our designer already made a lot of beautiful prototype of rooms
              that inspire you.
            </p>
            <Link to="/shop" className="primary-btn">Explore More</Link>
          </div>
          <div className="inspiration-media">
            <div className="media-large">
              <img
                src="https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=900&q=80"
                alt="Inspiration room"
              />
              <div className="media-caption">
                <span>01 — Bed Room</span>
                <h4>Inner Peace</h4>
              </div>
            </div>
            <div className="media-stack">
              <img
                src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=80"
                alt="Light room"
              />
              <div className="media-dots">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className="share">
        <div className="container">
          <div className="section-head share-head">
            <p className="eyebrow">Share your setup with</p>
            <h2>#FurniroFurniture</h2>
          </div>
          <div className="share-collage">
            {shareImages.map((img) => (
              <div className={`share-item ${img.layout}`} key={img.id}>
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function getCategoryImage(slug: string) {
  const images: Record<string, string> = {
    dining: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80",
    living: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80",
    bedroom: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80",
  };
  return images[slug] || RANGE_FALLBACK_IMAGE;
}

const shareImages = [
  {
    id: "left-shelf",
    layout: "tile-left-shelf",
    src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=420&q=80",
    alt: "Shelf corner",
  },
  {
    id: "left-desk",
    layout: "tile-left-desk",
    src: "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=980&q=80",
    alt: "Desk and workspace",
  },
  {
    id: "left-chair",
    layout: "tile-left-chair",
    src: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=520&q=80",
    alt: "Accent chair",
  },
  {
    id: "left-stools",
    layout: "tile-left-stools",
    src: "https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=760&q=80",
    alt: "Minimal side tables",
  },
  {
    id: "center-dining",
    layout: "tile-center-dining",
    src: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=760&q=80",
    alt: "Dining room",
  },
  {
    id: "right-bedroom",
    layout: "tile-right-bedroom",
    src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80",
    alt: "Bedroom",
  },
  {
    id: "right-sunroom",
    layout: "tile-right-sunroom",
    src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=520&q=80",
    alt: "Sunlit dining area",
  },
  {
    id: "right-frame",
    layout: "tile-right-frame",
    src: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=500&q=80",
    alt: "Decor wall",
  },
  {
    id: "right-kitchen",
    layout: "tile-right-kitchen",
    src: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=620&q=80",
    alt: "Kitchen shelf",
  },
];
