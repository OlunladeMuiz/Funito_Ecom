import { PageBanner } from "../../components";
import "./PolicyPage.css";

export function PaymentPage() {
  return (
    <div className="policy-page">
      <PageBanner title="Payment Options" breadcrumbs={[{ label: "Payment" }]} />

      <div className="container">
        <div className="policy-content">
          <section>
            <h2>Accepted Payment Methods</h2>
            <p>We accept a variety of payment methods to make your shopping experience convenient:</p>
            <ul>
              <li><strong>Credit Cards:</strong> Visa, MasterCard, American Express</li>
              <li><strong>Debit Cards:</strong> All major bank debit cards</li>
              <li><strong>Digital Wallets:</strong> Apple Pay, Google Pay</li>
              <li><strong>Bank Transfer:</strong> Direct bank transfers</li>
            </ul>
          </section>

          <section>
            <h2>Secure Payments</h2>
            <p>
              All transactions are secured with industry-standard SSL encryption. 
              We use Stripe for payment processing, ensuring your financial information 
              is always protected.
            </p>
          </section>

          <section>
            <h2>Payment Processing</h2>
            <p>
              Your payment will be processed immediately upon order confirmation. 
              You will receive an email confirmation with your order details and 
              payment receipt.
            </p>
          </section>

          <section>
            <h2>Currency</h2>
            <p>
              All prices are displayed in Nigerian Naira (NGN). International 
              customers may see currency conversion rates applied by their payment provider.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function ReturnsPage() {
  return (
    <div className="policy-page">
      <PageBanner title="Returns & Refunds" breadcrumbs={[{ label: "Returns" }]} />

      <div className="container">
        <div className="policy-content">
          <section>
            <h2>Return Policy</h2>
            <p>
              We want you to be completely satisfied with your purchase. If you're not 
              happy with your order, you may return it within 30 days of delivery.
            </p>
          </section>

          <section>
            <h2>Eligibility</h2>
            <ul>
              <li>Items must be unused and in original packaging</li>
              <li>Items must be returned within 30 days of delivery</li>
              <li>Proof of purchase is required</li>
              <li>Custom or personalized items cannot be returned</li>
            </ul>
          </section>

          <section>
            <h2>How to Return</h2>
            <ol>
              <li>Contact our support team at support@furniro.com</li>
              <li>Receive your Return Authorization number</li>
              <li>Pack the item securely in original packaging</li>
              <li>Ship to our returns center</li>
            </ol>
          </section>

          <section>
            <h2>Refunds</h2>
            <p>
              Once we receive your return, we'll inspect the item and process your 
              refund within 5-7 business days. Refunds will be credited to your 
              original payment method.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="policy-page">
      <PageBanner title="Privacy Policy" breadcrumbs={[{ label: "Privacy" }]} />

      <div className="container">
        <div className="policy-content">
          <section>
            <h2>Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li>Name and contact information</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Order history and preferences</li>
            </ul>
          </section>

          <section>
            <h2>How We Use Your Information</h2>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and updates</li>
              <li>Respond to your inquiries</li>
              <li>Improve our services and user experience</li>
            </ul>
          </section>

          <section>
            <h2>Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your 
              personal information. All data is encrypted in transit and at rest.
            </p>
          </section>

          <section>
            <h2>Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information 
              at any time. Contact us at privacy@furniro.com for any requests.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at 
              privacy@furniro.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
