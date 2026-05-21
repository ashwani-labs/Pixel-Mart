import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import {
  useGetAdminStoreSettingsQuery,
  useUpdateStoreSettingsMutation,
  useUploadStoreLogoMutation,
} from '../store/api/settingsApi';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setPublicSettings } from '../store/slices/settingsSlice';
import { setAdminPrimaryOverride } from '../store/slices/themeSlice';
import { useGetPublicSettingsQuery } from '../store/api/settingsApi';
import styles from './AdminSettingsPage.module.css';

const schema = z.object({
  storeName: z.string().min(1).max(255),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Use hex format #RRGGBB'),
  supportEmail: z.string().max(255),
  marketCurrencyCode: z.string().min(1).max(8),
  marketCurrencySymbol: z.string().min(1).max(8),
  marketLocale: z.string().min(1).max(16),
  taxEnabled: z.boolean(),
  taxRatePercent: z.coerce.number().min(0).max(100),
  taxLabel: z.string().min(1).max(64),
});

type FormValues = z.infer<typeof schema>;

export function AdminSettingsPage() {
  const dispatch = useDispatch();
  const storeName = useSelector((s: RootState) => s.settings.storeName);
  const logoUrl = useSelector((s: RootState) => s.settings.logoUrl);
  const { data, isLoading } = useGetAdminStoreSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateStoreSettingsMutation();
  const [uploadLogo, { isLoading: uploadingLogo }] = useUploadStoreLogoMutation();
  const { refetch: refetchPublic } = useGetPublicSettingsQuery();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      storeName: 'PixelMart',
      primaryColor: '#6366f1',
      supportEmail: '',
      marketCurrencyCode: 'INR',
      marketCurrencySymbol: '₹',
      marketLocale: 'en-IN',
      taxEnabled: true,
      taxRatePercent: 18,
      taxLabel: 'GST',
    },
  });

  const primaryColor = watch('primaryColor');
  const previewName = watch('storeName') || storeName;

  useEffect(() => {
    if (data) {
      reset({
        storeName: data.storeName,
        primaryColor: data.primaryColor,
        supportEmail: data.supportEmail ?? '',
        marketCurrencyCode: data.marketCurrencyCode,
        marketCurrencySymbol: data.marketCurrencySymbol,
        marketLocale: data.marketLocale,
        taxEnabled: data.taxEnabled,
        taxRatePercent: data.taxRatePercent,
        taxLabel: data.taxLabel,
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: FormValues) => {
    setMessage(null);
    try {
      await updateSettings(values).unwrap();
      const publicResult = await refetchPublic();
      if (publicResult.data) {
        dispatch(setPublicSettings(publicResult.data));
        dispatch(setAdminPrimaryOverride(publicResult.data.primaryColor));
        document.title = publicResult.data.storeName;
      }
      setMessage('Store settings saved.');
    } catch {
      setMessage('Failed to save settings.');
    }
  };

  const onLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);
    try {
      await uploadLogo(file).unwrap();
      const publicResult = await refetchPublic();
      if (publicResult.data) {
        dispatch(setPublicSettings(publicResult.data));
      }
      setMessage('Logo uploaded.');
    } catch {
      setMessage('Logo upload failed.');
    }
    e.target.value = '';
  };

  if (isLoading) {
    return <p className={styles.loading}>Loading settings…</p>;
  }

  return (
    <div className={styles.page}>
      <Link to="/admin">← Admin home</Link>
      <h1>Store settings</h1>
      <p className={styles.subtitle}>Branding and market defaults (Week 1 Day 5).</p>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <label>
            Store name
            <input {...register('storeName')} />
            {errors.storeName && <span className={styles.error}>{errors.storeName.message}</span>}
          </label>
          <label>
            Primary color
            <div className={styles.colorRow}>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setValue('primaryColor', e.target.value, { shouldValidate: true })}
              />
              <input {...register('primaryColor')} />
            </div>
            {errors.primaryColor && <span className={styles.error}>{errors.primaryColor.message}</span>}
          </label>
          <label>
            Support email
            <input type="email" {...register('supportEmail')} placeholder="support@example.com" />
          </label>
          <div className={styles.row}>
            <label>
              Currency code
              <input {...register('marketCurrencyCode')} />
            </label>
            <label>
              Symbol
              <input {...register('marketCurrencySymbol')} />
            </label>
          </div>
          <label>
            Locale
            <input {...register('marketLocale')} />
          </label>
          <label className={styles.check}>
            <input type="checkbox" {...register('taxEnabled')} />
            Tax enabled
          </label>
          <div className={styles.row}>
            <label>
              Tax rate (%)
              <input type="number" step="0.01" {...register('taxRatePercent')} />
            </label>
            <label>
              Tax label
              <input {...register('taxLabel')} />
            </label>
          </div>
          <label>
            Logo image
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={styles.file}
              onChange={onLogoSelected}
              disabled={uploadingLogo}
            />
          </label>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          {message && <p className={styles.message}>{message}</p>}
        </form>

        <aside className={styles.preview}>
          <h2>Preview</h2>
          <div className={styles.previewHeader} style={{ borderColor: primaryColor }}>
            {logoUrl ? (
              <img src={logoUrl} alt="" className={styles.previewLogo} />
            ) : (
              <span className={styles.previewMark} style={{ color: primaryColor }}>
                ◆
              </span>
            )}
            <span style={{ color: primaryColor }}>{previewName}</span>
          </div>
          <p className={styles.previewHint}>Reload or navigate to see header changes everywhere.</p>
        </aside>
      </div>
    </div>
  );
}
