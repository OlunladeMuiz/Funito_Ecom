import { useEffect, useState } from "react";
import { useAuth } from "../../api/hooks";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/client";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get("/admin/dashboard");
        setStats(res);
      } catch (err: any) {
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (!user || user.role !== "ADMIN") {
    return <div className="admin-access-denied">Access denied. Admins only.</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name} ({user.email})</p>
      <div className="admin-stats">
        {loading ? (
          <div className="admin-loading">Loading stats...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : stats ? (
          <>
            <div className="stat-card"><strong>{stats.totalUsers}</strong><span>Users</span></div>
            <div className="stat-card"><strong>{stats.totalProducts}</strong><span>Products</span></div>
            <div className="stat-card"><strong>{stats.totalOrders}</strong><span>Orders</span></div>
            <div className="stat-card"><strong>${stats.totalRevenue.toLocaleString()}</strong><span>Revenue</span></div>
          </>
        ) : null}
      </div>
      <div className="admin-links">
        <Link to="/admin/users">Manage Users</Link>
        <Link to="/admin/products">Manage Products</Link>
        <Link to="/admin/orders">Manage Orders</Link>
        <Link to="/admin/categories">Manage Categories</Link>
        <Link to="/admin/reviews">Moderate Reviews</Link>
      </div>
      <div className="admin-section-placeholder">
        (Feature pages coming soon. Contact your developer to enable full management tools.)
      </div>
    </div>
  );
}
