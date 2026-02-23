import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "../../contexts/CartContext";
import { useAddresses } from "../../api/hooks";
import { ordersApi } from "../../api";
import { formatPrice } from "../../utils/format";
import { PageBanner, Loading } from "../../components";
import "./CheckoutPage.css";

// Initialize Stripe - replace with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

export function CheckoutPage() {
  const { cart, total, itemCount, loading: cartLoading, syncLocalCartToBackend, refetch: refetchCart } = useCart();
  const { addresses, loading: addressesLoading } = useAddresses();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddr.id);
    }
  }, [addresses, selectedAddress]);

  const handleCreateOrder = async () => {
    // Prevent double-clicks
    if (processing) return;
    
    if (!selectedAddress) {
      setError("Please select a shipping address");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Sync local cart to backend if needed
      await syncLocalCartToBackend();
      
      // Call checkout API
      const response = await ordersApi.checkout({ shippingAddressId: selectedAddress });
      setOrderId(response.orderId);
      setClientSecret(response.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
      setProcessing(false);
    }
  };

  // Wait for cart to load before checking if empty
  if (cartLoading) {
    return <Loading fullPage />;
  }

  // Redirect to cart if empty
  const isEmpty = !cart || cart.items.length === 0;

  return isEmpty ? (
    <div className="checkout-page">
      <PageBanner title="Checkout" breadcrumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <div className="container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checking out.</p>
          <a href="/shop" className="primary-btn">Continue Shopping</a>
        </div>
      </div>
    </div>
  ) : (
    <div className="checkout-page">
      <PageBanner title="Checkout" breadcrumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

      <div className="container">
        <div className="checkout-layout">
          {/* Left Column - Form */}
          <div className="checkout-form">
            {!clientSecret ? (
              <>
                <section className="checkout-section">
                  <h2>Shipping Address</h2>
                  {addressesLoading ? (
                    <Loading />
                  ) : addresses.length === 0 ? (
                    <div className="no-addresses">
                      <p>You don't have any saved addresses.</p>
                      <p>Please add an address in your profile first.</p>
                      <a href="/profile" className="add-address-link">Add Address</a>
                    </div>
                  ) : (
                    <div className="address-list">
                      {addresses.map((address) => (
                        <label key={address.id} className={`address-option ${selectedAddress === address.id ? "selected" : ""}`}>
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddress === address.id}
                            onChange={(e) => setSelectedAddress(e.target.value)}
                          />
                          <div className="address-content">
                            <span className="address-label">
                              {address.label || "Address"}
                              {address.isDefault && <span className="default-badge">Default</span>}
                            </span>
                            <p>
                              {address.line1}
                              {address.line2 && `, ${address.line2}`}
                              <br />
                              {address.city}, {address.state} {address.zip}
                              <br />
                              {address.country}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </section>

                {error && <div className="error-message">{error}</div>}

                <button 
                  className="proceed-btn" 
                  onClick={handleCreateOrder}
                  disabled={!selectedAddress || processing}
                >
                  {processing ? "Processing..." : "Proceed to Payment"}
                </button>
              </>
            ) : clientSecret ? (
              <section className="checkout-section">
                <h2>Payment</h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm orderId={orderId!} onSuccess={() => refetchCart()} />
                </Elements>
              </section>
            ) : null}
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.items.map((item) => (
                <div key={item.id} className="summary-item">
                  <img
                    src={item.product.images[0]?.url || "https://via.placeholder.com/60"}
                    alt={item.product.name}
                  />
                  <div className="item-details">
                    <span className="item-name">{item.product.name}</span>
                    <span className="item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="item-price">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Items ({itemCount})</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({ orderId, onSuccess }: { orderId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Payment failed");
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?success=true`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setProcessing(false);
    } else {
      onSuccess();
      navigate(`/orders/${orderId}?success=true`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <PaymentElement />
      {error && <div className="payment-error">{error}</div>}
      <button type="submit" disabled={!stripe || processing} className="pay-btn">
        {processing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}
