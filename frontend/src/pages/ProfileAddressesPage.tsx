import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RequireAuth } from '../components/auth/RequireAuth';
import { AddressForm } from '../components/address/AddressForm';
import type { Address, UpsertAddressRequest } from '../types/address';
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from '../store/api/orderApi';
import styles from './ProfileAddressesPage.module.css';

function AddressesContent() {
  const { data: addresses, isLoading } = useGetAddressesQuery();
  const [createAddress] = useCreateAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefault] = useSetDefaultAddressMutation();
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (body: UpsertAddressRequest) => {
    setSaving(true);
    try {
      if (editing) {
        await updateAddress({ id: editing.id, body }).unwrap();
        setEditing(null);
      } else {
        await createAddress(body).unwrap();
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <p className={styles.muted}>Loading addresses…</p>;
  }

  const list = addresses ?? [];

  return (
    <div className={styles.page}>
      <Link to="/profile" className={styles.back}>
        ← Profile
      </Link>
      <h1>Saved addresses</h1>
      <p className={styles.muted}>Enter your PIN first to autofill city and state.</p>

      {!showForm && !editing && (
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
        >
          Add new address
        </button>
      )}

      {(showForm || editing) && (
        <AddressForm
          initial={editing ?? undefined}
          submitting={saving}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={handleSave}
        />
      )}

      {list.length === 0 && !showForm && !editing ? (
        <p className={styles.muted}>No addresses yet.</p>
      ) : (
        <ul className={styles.list}>
          {list.map((addr) => (
            <li key={addr.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <strong>{addr.label ?? 'Address'}</strong>
                {addr.isDefault && <span className={styles.badge}>Default</span>}
              </div>
              <p className={styles.lines}>
                {addr.fullName} · {addr.phone}
              </p>
              <p className={styles.lines}>
                {addr.addressLine1}
                {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
              </p>
              <p className={styles.lines}>
                {addr.city}, {addr.state} {addr.pincode}
              </p>
              {addr.postOfficeName && (
                <p className={styles.lines}>Post office: {addr.postOfficeName}</p>
              )}
              <div className={styles.cardActions}>
                {!addr.isDefault && (
                  <button type="button" onClick={() => setDefault(addr.id)}>
                    Set default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditing(addr);
                    setShowForm(false);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => deleteAddress(addr.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ProfileAddressesPage() {
  return (
    <RequireAuth>
      <AddressesContent />
    </RequireAuth>
  );
}
