import { useState } from 'react';
import {
  useCreateOfferMutation,
  useDeleteOfferMutation,
  useGetAdminOffersQuery,
  useGetCategoriesQuery,
} from '../store/api/catalogApi';
import type { OfferScope, OfferType, UpsertOfferRequest } from '../types/catalog';
import styles from './PlaceholderPage.module.css';
import formStyles from './AdminProductsPage.module.css';

const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 16);

function toIso(value: string) {
  return new Date(value).toISOString();
}

export function AdminOffersPage() {
  const { data: offers, isLoading } = useGetAdminOffersQuery();
  const { data: categories } = useGetCategoriesQuery();
  const [createOffer, { isLoading: creating }] = useCreateOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<OfferType>('PERCENT');
  const [scope, setScope] = useState<OfferScope>('CATEGORY');
  const [productId, setProductId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [value, setValue] = useState('10');
  const [startsAt, setStartsAt] = useState(nowLocal());
  const [endsAt, setEndsAt] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const body: UpsertOfferRequest = {
      name: name.trim(),
      type,
      scope,
      productId: scope === 'PRODUCT' ? productId.trim() : null,
      categoryId: scope === 'CATEGORY' ? categoryId : null,
      value: Number(value),
      startsAt: toIso(startsAt),
      endsAt: endsAt ? toIso(endsAt) : null,
      couponCode: couponCode.trim() || null,
      active: true,
    };

    try {
      await createOffer(body).unwrap();
      setMessage('Offer created.');
      setName('');
      setProductId('');
      setCouponCode('');
    } catch {
      setMessage('Could not create offer. Check scope, target, dates, and value.');
    }
  };

  return (
    <div className={styles.page}>
      <h1>Admin — Offers</h1>
      <p>Create product or category discounts. Cart-level offers are reserved for a later version.</p>

      <form className={formStyles.uploadForm} onSubmit={handleCreate}>
        <label>
          Offer name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value as OfferType)}>
            <option value="PERCENT">Percent off</option>
            <option value="FIXED">Fixed amount off</option>
          </select>
        </label>
        <label>
          Scope
          <select value={scope} onChange={(e) => setScope(e.target.value as OfferScope)}>
            <option value="CATEGORY">Category</option>
            <option value="PRODUCT">Product</option>
          </select>
        </label>
        {scope === 'CATEGORY' ? (
          <label>
            Category
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Choose category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            Product ID
            <input value={productId} onChange={(e) => setProductId(e.target.value)} required />
          </label>
        )}
        <label>
          Value
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </label>
        <label>
          Starts at
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </label>
        <label>
          Ends at
          <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </label>
        <label>
          Coupon code (optional)
          <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
        </label>
        <button type="submit" disabled={creating}>
          {creating ? 'Creating…' : 'Create offer'}
        </button>
        {message && <p className={formStyles.message}>{message}</p>}
      </form>

      <section>
        <h2>Existing offers</h2>
        {isLoading ? (
          <p>Loading offers…</p>
        ) : offers && offers.content.length > 0 ? (
          <ul className={formStyles.list}>
            {offers.content.map((offer) => (
              <li key={offer.id}>
                <strong>{offer.name}</strong>
                <span>
                  {offer.type} {offer.value} on {offer.scope.toLowerCase()}
                  {offer.couponCode ? ` with ${offer.couponCode}` : ''}
                </span>
                <button type="button" onClick={() => deleteOffer(offer.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No offers yet.</p>
        )}
      </section>
    </div>
  );
}
