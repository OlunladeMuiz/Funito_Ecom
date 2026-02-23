import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAddresses } from "../../api/hooks";
import { usersApi } from "../../api";
import { PageBanner, Loading } from "../../components";
import type { Address } from "../../api/types";
import "./ProfilePage.css";

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const { addresses, loading: addressesLoading, refetch: refetchAddresses } = useAddresses();

  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "password">("profile");

  return (
    <div className="profile-page">
      <PageBanner title="My Account" breadcrumbs={[{ label: "Account" }]} />

      <div className="container">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="user-info">
              <div className="avatar">
                {(user as any)?.avatarUrl ? (
                  <img src={(user as any).avatarUrl} alt={user?.name || ''} />
                ) : (
                  <span>{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
            </div>

            <nav className="profile-nav">
              <button
                className={activeTab === "profile" ? "active" : ""}
                onClick={() => setActiveTab("profile")}
              >
                Profile Settings
              </button>
              <button
                className={activeTab === "addresses" ? "active" : ""}
                onClick={() => setActiveTab("addresses")}
              >
                Addresses
              </button>
              <button
                className={activeTab === "password" ? "active" : ""}
                onClick={() => setActiveTab("password")}
              >
                Change Password
              </button>
            </nav>
          </aside>

          <main className="profile-content">
            {activeTab === "profile" && (
              <ProfileSettings user={user} onUpdate={async () => {
                const updated = await usersApi.getProfile();
                setUser(updated);
              }} />
            )}
            {activeTab === "addresses" && (
              addressesLoading ? (
                <Loading />
              ) : (
                <AddressesSection addresses={addresses} onUpdate={refetchAddresses} />
              )
            )}
            {activeTab === "password" && <PasswordSection />}
          </main>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ user, onUpdate }: { user: any; onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await usersApi.updateProfile(formData);
      onUpdate();
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="profile-section">
      <h2>Profile Settings</h2>
      <form onSubmit={handleSubmit}>
        {message && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user?.email || ""} disabled />
          <span className="help-text">Email cannot be changed</span>
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>

        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}

function AddressesSection({ addresses, onUpdate }: { addresses: Address[]; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "Indonesia",
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await usersApi.updateAddress(editingId, formData);
      } else {
        await usersApi.createAddress(formData as Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">);
      }
      onUpdate();
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData(address);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await usersApi.deleteAddress(id);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      label: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      zip: "",
      country: "Indonesia",
      isDefault: false,
    });
  };

  return (
    <section className="profile-section">
      <div className="section-header">
        <h2>My Addresses</h2>
        {!showForm && (
          <button className="add-btn" onClick={() => setShowForm(true)}>
            + Add Address
          </button>
        )}
      </div>

      {showForm && (
        <form className="address-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Label (e.g., Home, Office)</label>
              <input
                type="text"
                value={formData.label || ""}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Home"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address Line 1 *</label>
            <input
              type="text"
              value={formData.line1 || ""}
              onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Address Line 2</label>
            <input
              type="text"
              value={formData.line2 || ""}
              onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>State/Province *</label>
              <input
                type="text"
                value={formData.state || ""}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Postal Code *</label>
              <input
                type="text"
                value={formData.zip || ""}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Country *</label>
              <input
                type="text"
                value={formData.country || ""}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              />
            </div>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isDefault || false}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            />
            Set as default address
          </label>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Address" : "Add Address"}
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className="addresses-list">
          {addresses.length === 0 ? (
            <p className="empty-text">You haven't added any addresses yet.</p>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="address-card">
                <div className="address-header">
                  <span className="address-label">
                    {address.label || "Address"}
                    {address.isDefault && <span className="default-badge">Default</span>}
                  </span>
                  <div className="address-actions">
                    <button onClick={() => handleEdit(address)}>Edit</button>
                    <button onClick={() => handleDelete(address.id)}>Delete</button>
                  </div>
                </div>
                <p>
                  {address.line1}
                  {address.line2 && <>, {address.line2}</>}
                  <br />
                  {address.city}, {address.state} {address.zip}
                  <br />
                  {address.country}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

function PasswordSection() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    setLoading(true);

    try {
      await usersApi.changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      setMessage({ type: "success", text: "Password changed successfully" });
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="profile-section">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        {message && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </section>
  );
}
