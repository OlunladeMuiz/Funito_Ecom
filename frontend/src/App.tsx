import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Layout, ProtectedRoute } from "./components";
import {
  HomePage,
  ShopPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  LoginPage,
  SignupPage,
  ProfilePage,
  OrdersPage,
  WishlistPage,
  AboutPage,
  ContactPage,
  PaymentPage,
  ReturnsPage,
  PrivacyPage,
} from "./pages";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminUsers from "./pages/AdminDashboard/AdminUsers";
import AdminProducts from "./pages/AdminDashboard/AdminProducts";
import AdminOrders from "./pages/AdminDashboard/AdminOrders";
import AdminCategories from "./pages/AdminDashboard/AdminCategories";
import AdminReviews from "./pages/AdminDashboard/AdminReviews";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Auth pages - no layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Main pages with layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* Admin dashboard route (protected) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute>
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reviews"
                element={
                  <ProtectedRoute>
                    <AdminReviews />
                  </ProtectedRoute>
                }
              />
              {/* Protected routes - require authentication */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
