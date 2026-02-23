import "dotenv/config";
import { PrismaClient, type Category } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hashPassword } from "../src/utils/password";

// Instantiate PrismaClient with PostgreSQL adapter
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user - password from env or generate secure random
  let rawAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!rawAdminPassword) {
    rawAdminPassword = `Admin_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    console.warn("WARNING: No ADMIN_DEFAULT_PASSWORD set. Using generated password.");
    console.warn("Set ADMIN_DEFAULT_PASSWORD in .env for consistent admin access.");
    console.log("Generated admin password:", rawAdminPassword);
  }
  const adminPassword = await hashPassword(rawAdminPassword);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      passwordHash: adminPassword,
      name: "Admin",
      role: "ADMIN",
      isVerified: true,
    },
    create: {
      email: "admin@example.com",
      passwordHash: adminPassword,
      name: "Admin",
      role: "ADMIN",
      isVerified: true,
    },
  });
  console.log("Created/updated admin user:", admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "dining" },
      update: {},
      create: { name: "Dining", slug: "dining" },
    }),
    prisma.category.upsert({
      where: { slug: "living" },
      update: {},
      create: { name: "Living", slug: "living" },
    }),
    prisma.category.upsert({
      where: { slug: "bedroom" },
      update: {},
      create: { name: "Bedroom", slug: "bedroom" },
    }),
  ]);
  console.log("Created categories:", categories.length);

  // Create products
  // Note: In this schema, `price` = current selling price, `originalPrice` = original price before discount
  // This is an inverted convention (typically originalPrice would be lower). Consider renaming to `originalPrice`.
  const products = [
    // Dining
    {
      name: "Syltherine",
      slug: "syltherine",
      description: "Stylish cafe chair with modern comfort and solid build.",
      price: 2500000,
      originalPrice: 3500000,
      stock: 25,
      categorySlug: "dining",
      images: [
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Leviosa",
      slug: "leviosa",
      description: "Minimal chair with soft fabric and a calm presence.",
      price: 2500000,
      stock: 18,
      categorySlug: "dining",
      images: [
        "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=800&q=80",
      ],
    },
    // Living
    {
      name: "Lolito",
      slug: "lolito",
      description: "Luxury big sofa for spacious living rooms.",
      price: 7000000,
      originalPrice: 14000000,
      stock: 12,
      categorySlug: "living",
      images: [
        "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Respira",
      slug: "respira",
      description: "Outdoor bar table and stool set.",
      price: 500000,
      stock: 30,
      categorySlug: "living",
      images: [
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
      ],
    },
    // Bedroom
    {
      name: "Grifo",
      slug: "grifo",
      description: "Night lamp with elegant silhouette.",
      price: 1500000,
      stock: 50,
      categorySlug: "bedroom",
      images: [
        "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Muggo",
      slug: "muggo",
      description: "Small mug for cozy spaces.",
      price: 150000,
      stock: 120,
      categorySlug: "bedroom",
      images: [
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Pingky",
      slug: "pingky",
      description: "Cute bed set with soft pastel tones.",
      price: 7000000,
      originalPrice: 14000000,
      stock: 10,
      categorySlug: "bedroom",
      images: [
        "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Potty",
      slug: "potty",
      description: "Minimalist flower pot for home decor.",
      price: 500000,
      stock: 40,
      categorySlug: "bedroom",
      images: [
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
      ],
    },
    // Additional products
    {
      name: "Oslo Armchair",
      slug: "oslo-armchair",
      description: "Scandinavian design armchair with premium comfort.",
      price: 4500000,
      originalPrice: 5500000,
      stock: 8,
      categorySlug: "living",
      images: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Bergen Dining Table",
      slug: "bergen-dining-table",
      description: "Solid oak dining table for family gatherings.",
      price: 12000000,
      stock: 4,
      categorySlug: "dining",
      images: [
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Napoli Bookshelf",
      slug: "napoli-bookshelf",
      description: "Modern 5-tier bookshelf with industrial charm.",
      price: 3200000,
      originalPrice: 4000000,
      stock: 12,
      categorySlug: "living",
      images: [
        "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Luna Queen Bed",
      slug: "luna-queen-bed",
      description: "Upholstered queen bed frame with elegant design.",
      price: 8500000,
      stock: 6,
      categorySlug: "bedroom",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Kyoto Coffee Table",
      slug: "kyoto-coffee-table",
      description: "Japanese-inspired coffee table with clean lines.",
      price: 2800000,
      stock: 15,
      categorySlug: "living",
      images: [
        "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Milano Dining Chair",
      slug: "milano-dining-chair",
      description: "Set of 2 velvet dining chairs for modern homes.",
      price: 1800000,
      originalPrice: 2200000,
      stock: 20,
      categorySlug: "dining",
      images: [
        "https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Nordic TV Stand",
      slug: "nordic-tv-stand",
      description: "Minimalist TV console with ample storage.",
      price: 3500000,
      stock: 9,
      categorySlug: "living",
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Verona Wardrobe",
      slug: "verona-wardrobe",
      description: "3-door wooden wardrobe with mirror panel.",
      price: 9500000,
      originalPrice: 11000000,
      stock: 3,
      categorySlug: "bedroom",
      images: [
        "https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Zen Floor Lamp",
      slug: "zen-floor-lamp",
      description: "Bamboo floor lamp with soft ambient glow.",
      price: 1200000,
      stock: 25,
      categorySlug: "living",
      images: [
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Paris Side Table",
      slug: "paris-side-table",
      description: "Gold accent side table for elegant spaces.",
      price: 950000,
      stock: 30,
      categorySlug: "living",
      images: [
        "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Stockholm Dresser",
      slug: "stockholm-dresser",
      description: "6-drawer bedroom dresser with soft-close drawers.",
      price: 6500000,
      originalPrice: 7500000,
      stock: 5,
      categorySlug: "bedroom",
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Venice Mirror",
      slug: "venice-mirror",
      description: "Large decorative wall mirror with ornate frame.",
      price: 2200000,
      stock: 18,
      categorySlug: "bedroom",
      images: [
        "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80",
      ],
    },
  ];

  for (const product of products) {
    const category = categories.find((c: Category) => c.slug === product.categorySlug);
    
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
        categoryId: category?.id,
        images: {
          create: product.images.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
      },
    });
    console.log("Created product:", created.name);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
