import React, { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import "./AdminProducts.css";

// Responsive styles are handled in AdminProducts.css

interface Review {
  id: string;
  product: { name: string };
  user: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient.get<Review[]>("/admin/reviews")
      .then((res) => setReviews(res))
      .catch(() => setError("Failed to fetch reviews"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-page-container">
      <h2>Review Moderation</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>User</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>{review.product.name}</td>
                <td>{review.user.name}</td>
                <td>{review.rating}</td>
                <td>{review.comment}</td>
                <td>{new Date(review.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReviews;
