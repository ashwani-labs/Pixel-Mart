import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    return <p className={styles.muted}>{t('address.loading')}</p>;
  }

  const list = addresses ?? [];

  return (
    <div className={styles.page}>
      <Link to="/profile" className={styles.back}>
        {t('address.back')}
      </Link>
      <h1>{t('address.title')}</h1>
      <p className={styles.muted}>{t('address.hint')}</p>

      {!showForm && !editing && (
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
        >
          {t('address.add')}
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
        <p className={styles.muted}>{t('address.empty')}</p>
      ) : (
        <ul className={styles.list}>
          {list.map((addr) => (
            <li key={addr.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <strong>{addr.label ?? t('checkout.address')}</strong>
                {addr.isDefault && <span className={styles.badge}>{t('address.default')}</span>}
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
                <p className={styles.lines}>{t('address.postOffice')} {addr.postOfficeName}</p>
              )}
              <div className={styles.cardActions}>
                {!addr.isDefault && (
                  <button type="button" onClick={() => setDefault(addr.id)}>
                    {t('address.setDefault')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditing(addr);
                    setShowForm(false);
                  }}
                >
                  {t('common.edit')}
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => deleteAddress(addr.id)}
                >
                  {t('common.delete')}
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
