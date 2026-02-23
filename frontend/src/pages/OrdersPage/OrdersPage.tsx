import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../../api/hooks";
import { PageBanner, Loading } from "../../components";
import type { Order } from "../../api/types";
import "./OrdersPage.css";

export function OrdersPage() {
  const { orders, loading } = useOrders();
  const [filter, setFilter] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "DELIVERED":
        return "success";
      case "PENDING":
      case "PROCESSING":
        return "warning";
      case "CANCELLED":
      case "REFUNDED":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <PageBanner title="My Orders" breadcrumbs={[{ label: "Orders" }]} />
        <div className="container">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <PageBanner title="My Orders" breadcrumbs={[{ label: "Orders" }]} />

      <div className="container">
        <div className="orders-header">
          <div className="filters">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All Orders
            </button>
            <button
              className={filter === "PENDING" ? "active" : ""}
              onClick={() => setFilter("PENDING")}
            >
              Pending
            </button>
            <button
              className={filter === "PAID" ? "active" : ""}
              onClick={() => setFilter("PAID")}
            >
              Paid
            </button>
            <button
              className={filter === "DELIVERED" ? "active" : ""}
              onClick={() => setFilter("DELIVERED")}
            >
              Delivered
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
            <Link to="/shop" className="shop-link">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                formatPrice={formatPrice}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  formatPrice,
  formatDate,
  getStatusColor,
}: {
  order: Order;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="order-card">
      <div className="order-header" onClick={() => setExpanded(!expanded)}>
        <div className="order-info">
          <span className="order-number">Order #{order.id.slice(-8)}</span>
          <span className="order-date">{formatDate(order.createdAt)}</span>
        </div>
        <div className="order-meta">
          <span className={`order-status ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <span className="order-total">{formatPrice(order.total)}</span>
          <button className="expand-btn">{expanded ? "−" : "+"}</button>
        </div>
      </div>

      {expanded && (
        <div className="order-details">
          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.id} className="order-item">
                <img
                  src={item.product?.images?.[0]?.url || "https://via.placeholder.com/60"}
                  alt={item.product?.name}
                />
                <div className="item-info">
                  <Link to={`/product/${item.productId}`} className="item-name">
                    {item.product?.name || "Product"}
                  </Link>
                  <span className="item-meta">
                    {formatPrice(item.unitPrice)} × {item.quantity}
                  </span>
                </div>
                <span className="item-subtotal">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
