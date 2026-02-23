import React, { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import "./AdminProducts.css";

// Responsive styles are handled in AdminProducts.css

interface Order {
  id: string;
  user: { name: string; email: string };
  total: number;
  status: string;
  createdAt: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient.get<Order[]>("/admin/orders")
      .then((res) => setOrders(res))
      .catch(() => setError("Failed to fetch orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-page-container">
      <h2>Order Management</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.user.name}</td>
                <td>{order.user.email}</td>
                <td>${order.total.toFixed(2)}</td>
                <td>{order.status}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;
