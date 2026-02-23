import React, { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import "./AdminProducts.css";

// Responsive styles are handled in AdminProducts.css

interface Category {
  id: string;
  name: string;
  description?: string;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient.get<Category[]>("/admin/categories")
      .then((res) => setCategories(res))
      .catch(() => setError("Failed to fetch categories"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-page-container">
      <h2>Category Management</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminCategories;
