import { Link } from 'react-router-dom';
import { PolicyPageLayout } from './PolicyPageLayout';

export function ShippingPolicyPage() {
  return (
    <PolicyPageLayout title="Shipping & delivery">
      <p>
        We deliver across India. Enter your PIN on any product page or at checkout to see an estimated
        delivery date for your location.
      </p>

      <h2>Delivery timelines</h2>
      <ul>
        <li>Metro cities: typically 2 business days after order confirmation</li>
        <li>Other serviceable PINs: typically 4 business days</li>
        <li>Large or bulky items may need an extra 1–2 days</li>
      </ul>

      <h2>Free delivery</h2>
      <p>
        Orders above <strong className="text-foreground">₹499</strong> qualify for free standard delivery.
        Below that threshold, a flat shipping fee is shown at checkout before you pay.
      </p>

      <h2>Order tracking</h2>
      <p>
        Once your order ships, you will receive email updates. You can also view status from{' '}
        <Link to="/orders" className="text-primary no-underline hover:underline">
          My orders
        </Link>{' '}
        when signed in.
      </p>

      <h2>Serviceable areas</h2>
      <p>
        Delivery is available to PIN codes validated at checkout. If your PIN cannot be verified, try a
        nearby post office PIN or contact{' '}
        <a href="mailto:support@pixelmart.local" className="text-primary">
          support@pixelmart.local
        </a>
        .
      </p>
    </PolicyPageLayout>
  );
}

export function ReturnsPolicyPage() {
  return (
    <PolicyPageLayout title="Returns & refunds">
      <p>
        We want you to shop with confidence. Most items can be returned within{' '}
        <strong className="text-foreground">7 days</strong> of delivery — the same promise shown in our
        store trust bar.
      </p>

      <h2>Eligible returns</h2>
      <ul>
        <li>Unused items in original packaging with tags intact</li>
        <li>Defective or wrong items received — contact us within 48 hours with photos</li>
        <li>Grocery and perishables: only if damaged or expired on arrival</li>
      </ul>

      <h2>Non-returnable items</h2>
      <ul>
        <li>Opened personal care, innerwear, or hygiene products</li>
        <li>Digital goods and gift cards</li>
        <li>Items marked “final sale” on the product page</li>
      </ul>

      <h2>How to return</h2>
      <ol className="m-0 list-decimal pl-4">
        <li>Sign in and open the order from My orders</li>
        <li>Choose the item and reason for return</li>
        <li>We will schedule a pickup or share a drop-off address</li>
        <li>Refund is initiated within 3–5 business days after we receive the item</li>
      </ol>

      <h2>Refunds</h2>
      <p>
        Refunds go back to the original payment method. COD orders are refunded via bank transfer or store
        credit — our team will contact you for details.
      </p>
    </PolicyPageLayout>
  );
}

export function FaqPage() {
  return (
    <PolicyPageLayout title="Frequently asked questions">
      <h2>How do I track my order?</h2>
      <p>
        Sign in and visit{' '}
        <Link to="/orders" className="text-primary no-underline hover:underline">
          My orders
        </Link>
        . You will also receive email updates when your order status changes.
      </p>

      <h2>Which payment methods do you accept?</h2>
      <p>
        UPI, credit and debit cards, net banking, and cash on delivery (COD) on eligible orders. Payment
        options are shown at checkout.
      </p>

      <h2>Is GST included in prices?</h2>
      <p>Yes — listed prices are GST-inclusive unless noted otherwise on the product page.</p>

      <h2>Can I change or cancel an order?</h2>
      <p>
        You can cancel before the order is packed. Once shipped, you may refuse delivery or use our{' '}
        <Link to="/returns" className="text-primary no-underline hover:underline">
          returns policy
        </Link>{' '}
        after delivery.
      </p>

      <h2>How do coupons work?</h2>
      <p>
        Enter a valid coupon code at checkout. One coupon per order unless stated. Offers cannot be combined
        with certain sale items.
      </p>

      <h2>How do I contact support?</h2>
      <p>
        Email{' '}
        <a href="mailto:support@pixelmart.local" className="text-primary">
          support@pixelmart.local
        </a>{' '}
        with your order ID. We aim to respond within one business day.
      </p>
    </PolicyPageLayout>
  );
}

export function PrivacyPolicyPage() {
  return (
    <PolicyPageLayout title="Privacy policy">
      <p>Last updated: June 2026. This policy describes how PixelMart handles your personal information.</p>

      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, email, phone when you register</li>
        <li>Delivery addresses and PIN codes you save</li>
        <li>Order history, payment method type (not full card numbers), and wishlist</li>
        <li>Device and usage data needed to run the store securely</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>Fulfil orders and send transactional emails</li>
        <li>Improve product recommendations and store experience</li>
        <li>Prevent fraud and comply with law</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We share data only with delivery partners, payment processors, and infrastructure providers needed
        to operate the service. We do not sell your personal data.
      </p>

      <h2>Your choices</h2>
      <p>
        You can update profile and addresses anytime. To delete your account, contact{' '}
        <a href="mailto:support@pixelmart.local" className="text-primary">
          support@pixelmart.local
        </a>
        .
      </p>
    </PolicyPageLayout>
  );
}

export function TermsPage() {
  return (
    <PolicyPageLayout title="Terms of use">
      <p>By using PixelMart you agree to these terms. If you do not agree, please do not use the service.</p>

      <h2>Accounts</h2>
      <p>
        You are responsible for keeping your login credentials secure. Provide accurate delivery and contact
        information so we can fulfil orders.
      </p>

      <h2>Products & pricing</h2>
      <p>
        We strive for accurate descriptions and images. Prices and offers may change without notice. We may
        cancel orders affected by pricing errors or stock issues and will refund any amount charged.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        PixelMart is provided as a demo retail platform. To the extent permitted by law, we are not liable
        for indirect or consequential damages arising from use of the store.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. Continued use after changes means you accept the revised terms.</p>
    </PolicyPageLayout>
  );
}
