# Furniro E-Commerce Platform

Welcome to the Furniro E-Commerce Platform — a robust, scalable, and modern full-stack application built with TypeScript, React, Node.js, Express, Prisma, and Stripe. This project demonstrates best practices in architecture, code quality, and developer experience, and is designed for rapid onboarding and seamless collaboration.

## Project Overview

Furniro is a feature-rich e-commerce solution supporting:

- Modern React frontend (Vite, TypeScript, Context API, modular components)
- Secure, scalable Node.js/Express backend (TypeScript, RESTful APIs)
- PostgreSQL database with Prisma ORM
- Stripe integration for payments
- Full authentication, admin dashboard, product management, and more

## Monorepo Structure

```
.
├── backend/      # Node.js, Express, Prisma, Stripe, REST API
│   ├── src/
│   │   ├── modules/      # Modular business logic (admin, auth, cart, etc.)
│   │   ├── middleware/   # Express middlewares (auth, error, etc.)
│   │   ├── lib/          # Utility libraries (prisma, stripe, etc.)
│   │   ├── routes/       # API route definitions
│   │   ├── config/       # Environment and config
│   │   └── utils/        # Utility functions
│   ├── prisma/           # Prisma schema, migrations, seed
│   └── uploads/          # Product image uploads
├── frontend/     # React, Vite, TypeScript, Context API
│   ├── src/
│   │   ├── api/          # API clients and hooks
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React context providers
│   │   ├── pages/        # Page-level components (Shop, Admin, etc.)
│   │   ├── utils/        # Frontend utilities
│   │   └── assets/       # Static assets
└── README.md     # Project documentation (this file)
```

## Engineering Practices

### Code Quality & Best Practices

- TypeScript everywhere: End-to-end type safety.
- Strict linting & formatting: ESLint, Prettier, and strict tsconfig.
- Modular, testable code: Each domain (auth, products, cart, etc.) is isolated for maintainability.
- CI/CD ready: Structure supports easy integration with GitHub Actions, Vercel, or Netlify.

### Team Onboarding & Collaboration

- Clear folder structure: Each concern is separated and documented.
- Self-explanatory code: Descriptive variable names, comments, and JSDoc where needed.
- Extensive README: Everything a new engineer or recruiter needs to understand the project.

## Setup & Development

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Stripe account (for payments)

### Backend

```bash
cd backend
cp .env.example .env   # Add your DB and Stripe keys
npm install
npx prisma migrate dev
npm run dev            # or: npx ts-node-dev --respawn --transpile-only src/index.ts
```

### Frontend

```bash
cd frontend
cp .env.example .env   # Add your Stripe publishable key
npm install
npm run dev
```

## Key Features

- Authentication: JWT-based, secure, with admin/user roles.
- Product Management: Admin dashboard for CRUD, image upload, and inventory.
- Cart & Checkout: Persistent cart, Stripe payments, order management.
- Reviews & Wishlist: Social features to drive engagement.
- Responsive UI: Mobile-first, accessible, and visually impressive.

## Problems Faced & Solutions

### 1. Image Uploads & External Links
   - Problem: Users could provide non-direct image links (e.g., Google Drive), causing images not to display.
   - Solution: Enforced direct image URLs and provided clear UI feedback. Backend processes uploaded images and returns a CDN-ready URL.

### 2. Category Selection
   - Problem: Users entered category names instead of UUIDs, causing backend validation errors.
   - Solution: Switched to a dropdown populated from the backend, ensuring only valid UUIDs are submitted.

### 3. Slug Generation
   - Problem: Backend required a slug, but frontend did not provide one.
   - Solution: Auto-generated slugs from product names on the frontend.

### 4. TypeScript Type Mismatches
   - Problem: Form handlers did not support both `<input>` and `<select>`, causing runtime errors.
   - Solution: Unified event handler to support both element types.

### 5. Responsive Modals
   - Problem: Product creation modal spanned the entire page, hurting UX.
   - Solution: Limited modal width and height, enabled scrolling, and improved mobile responsiveness.

### 6. Image Display in Product Table
   - Problem: Product images were not displaying due to backend structure mismatch.
   - Solution: Updated frontend to use the correct `product.images[0].url` property.

## Contributing & Team Workflow

- Branch naming: `feature/`, `bugfix/`, `chore/`
- Pull requests: Required for all changes, with code review.
- Testing: Use Vitest for backend unit/integration tests.
- Documentation: Update this README and add code comments for all major changes.

## How to Extend or Onboard

- Add a new feature: Create a new module in `backend/src/modules` and a new page/component in `frontend/src/pages` or `components`.
- Add a new API route: Define in `backend/src/routes` and document in the README.
- Add a new context or hook: Place in `frontend/src/contexts` or `api/hooks.ts`.
- Seed data: Use `backend/prisma/seed.ts`.

## Professionalism & Team Readiness

- Designed and delivered scalable, maintainable, and production-ready systems.
- This project is organized, documented, and demonstrates real-world problem-solving.
- Codebase is ready for onboarding, collaboration, and rapid iteration.
- Every challenge is documented and solved with best practices.

## Contact

For questions, onboarding, or collaboration, please reach out via [your email/contact info].

This README and project structure are designed to make it easy to understand, extend, and maintain for any engineer or recruiter.
