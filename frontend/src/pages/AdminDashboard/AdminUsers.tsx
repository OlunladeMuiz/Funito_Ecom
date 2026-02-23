import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    apiClient.get<any[]>("/admin/users")
      .then(res => setUsers(res))
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch {
      setError('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-users-page">
      <h2>Manage Users</h2>
      {loading ? (
        <div className="admin-loading">Loading users...</div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : (
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isVerified ? "Yes" : "No"}</td>
                <td>
                  <button className="admin-btn danger" onClick={() => handleDelete(u.id)} disabled={deletingId === u.id}>
                    {deletingId === u.id ? 'Removing...' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
