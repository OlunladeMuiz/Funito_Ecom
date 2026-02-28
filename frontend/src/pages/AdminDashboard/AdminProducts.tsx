import React, { useEffect, useState, useRef } from "react";
import { apiClient } from "../../api/client";
import "./AdminProducts.css";
import { useCategories } from "../../api/hooks";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: { id: string; name: string };
  images?: { url: string }[];
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: '', image: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    apiClient.get<Product[]>("/admin/products")
      .then((res) => setProducts(res))
      .catch(() => setError("Failed to fetch products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openModal = (mode: 'create' | 'edit', product?: Product) => {
    setModalMode(mode);
    setShowModal(true);
    if (mode === 'edit' && product) {
      setSelectedProduct(product);
      setForm({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category?.id || '',
        image: product.images && product.images.length > 0 ? product.images[0].url : '',
      });
    } else {
      setSelectedProduct(null);
      setForm({ name: '', price: '', stock: '', category: '', image: '' });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMode(null);
    setSelectedProduct(null);
    setForm({ name: '', price: '', stock: '', category: '', image: '' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      const res = await fetch(`${apiUrl}/admin/products/upload-image`, {
        method: "POST",
        headers: {
          ...(apiClient.getToken() ? { Authorization: `Bearer ${apiClient.getToken()}` } : {})
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm(f => ({ ...f, image: data.url }));
      setImageFile(null);
    } catch {
      setError("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch {
      setError('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFile) {
      await handleImageUpload();
      if (!form.image) return; // If upload failed, abort
    }
    try {
      const slug = generateSlug(form.name);
      if (modalMode === 'create') {
        await apiClient.post('/admin/products', {
          name: form.name,
          slug,
          price: Math.round(Number(form.price)),
          stock: Number(form.stock),
          categoryId: form.category,
          images: form.image ? [form.image] : [],
        });
      } else if (modalMode === 'edit' && selectedProduct) {
        await apiClient.put(`/admin/products/${selectedProduct.id}`, {
          name: form.name,
          slug,
          price: Math.round(Number(form.price)),
          stock: Number(form.stock),
          categoryId: form.category,
          images: form.image ? [form.image] : [],
        });
      }
      closeModal();
      fetchProducts();
    } catch {
      setError('Failed to save product');
    }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const { categories } = useCategories();

  return (
    <div className="admin-products-root">
      <div className="admin-products-hero-bg">
        <div className="admin-products-hero">
          <div className="admin-products-hero-content">
            <h1 className="admin-products-title">Product Management</h1>
            <p className="admin-products-desc">Manage your store's products with ease. Add, edit, and organize your inventory in a visually stunning dashboard.</p>
            <button className="admin-btn primary admin-products-add-btn" onClick={() => openModal('create')}>+ Add Product</button>
          </div>
        </div>
      </div>
      <div className="admin-products-content">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="admin-products-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>{product.category?.name || "-"}</td>
                    <td>
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0].url} alt={product.name} style={{ width: 40, height: 40, objectFit: "cover" }} />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <button className="admin-btn" onClick={() => openModal('edit', product)}>Edit</button>
                      <button className="admin-btn danger" onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}>
                        {deletingId === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3 style={{ marginBottom: 16 }}>{modalMode === 'create' ? 'Add Product' : 'Edit Product'}</h3>
              <form onSubmit={handleSubmit} className="modal-form">
                <label>Name<input name="name" value={form.name} onChange={handleFormChange} required /></label>
                <label>Price<input name="price" type="number" value={form.price} onChange={handleFormChange} required min="0" /></label>
                <label>Stock<input name="stock" type="number" value={form.stock} onChange={handleFormChange} required min="0" /></label>
                <label>Category
                  <select name="category" value={form.category} onChange={handleFormChange} required>
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </label>
                <label>Image URL
                  <input name="image" value={form.image} onChange={handleFormChange} placeholder="Paste image URL or upload below" />
                </label>
                <label>Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: 'block', marginTop: 6 }}
                    disabled={uploadingImage}
                  />
                </label>
                {imageFile && (
                  <div style={{ margin: '8px 0' }}>
                    <span style={{ fontSize: 13 }}>
                      Selected: {imageFile.name}
                    </span>
                    <button
                      type="button"
                      className="admin-btn primary"
                      style={{ marginLeft: 10 }}
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                )}
                {form.image && (
                  <div style={{ margin: '8px 0' }}>
                    <img src={form.image} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                  <button className="admin-btn primary" type="submit">{modalMode === 'create' ? 'Create' : 'Save'}</button>
                  <button className="admin-btn" type="button" onClick={closeModal}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
