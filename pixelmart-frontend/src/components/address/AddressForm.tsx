import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { Address, PincodeLookup, UpsertAddressRequest } from '../../types/address';
import { useLazyLookupPincodeQuery } from '../../store/api/orderApi';
import styles from './AddressForm.module.css';

type AddressFormValues = {
  label?: string;
  fullName: string;
  phone: string;
  pincode: string;
  postOfficeName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country?: string;
  isDefault: boolean;
};

interface Props {
  initial?: Address;
  onSubmit: (data: UpsertAddressRequest) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export function AddressForm({ initial, onSubmit, onCancel, submitting }: Props) {
  const { t } = useTranslation();
  const addressSchema = z.object({
    label: z.string().max(64).optional(),
    fullName: z.string().min(1, t('address.fullNameRequired')),
    phone: z.string().min(8, t('address.phoneRequired')),
    pincode: z.string().regex(/^[0-9]{6}$/, t('address.pinRequired')),
    postOfficeName: z.string().optional(),
    addressLine1: z.string().min(1, t('address.lineRequired')),
    addressLine2: z.string().optional(),
    city: z.string().min(1, t('address.cityRequired')),
    state: z.string().min(1, t('address.stateRequired')),
    country: z.string().optional(),
    isDefault: z.boolean(),
  });
  const [lookupPincode, { isFetching: lookingUp }] = useLazyLookupPincodeQuery();
  const [lookupData, setLookupData] = useState<PincodeLookup | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initial?.label ?? '',
      fullName: initial?.fullName ?? '',
      phone: initial?.phone ?? '',
      pincode: initial?.pincode ?? '',
      postOfficeName: initial?.postOfficeName ?? '',
      addressLine1: initial?.addressLine1 ?? '',
      addressLine2: initial?.addressLine2 ?? '',
      city: initial?.city ?? '',
      state: initial?.state ?? '',
      country: initial?.country ?? 'India',
      isDefault: initial?.isDefault ?? false,
    },
  });

  const pincode = watch('pincode');
  const selectedOffice = watch('postOfficeName');

  useEffect(() => {
    if (initial) {
      reset({
        label: initial.label ?? '',
        fullName: initial.fullName,
        phone: initial.phone,
        pincode: initial.pincode,
        postOfficeName: initial.postOfficeName ?? '',
        addressLine1: initial.addressLine1,
        addressLine2: initial.addressLine2 ?? '',
        city: initial.city,
        state: initial.state,
        country: initial.country,
        isDefault: initial.isDefault,
      });
    }
  }, [initial, reset]);

  const handleLookup = async () => {
    setLookupError(null);
    setLookupData(null);
    if (!/^[0-9]{6}$/.test(pincode)) {
      setLookupError(t('address.lookupFirst'));
      return;
    }
    try {
      const result = await lookupPincode(pincode).unwrap();
      setLookupData(result);
      setValue('state', result.state);
      setValue('city', result.city);
      if (result.postOffices.length === 1) {
        const office = result.postOffices[0];
        setValue('postOfficeName', office.name);
        if (office.block) {
          setValue('city', office.block);
        } else if (office.district) {
          setValue('city', office.district);
        }
      }
    } catch {
      setLookupError(t('address.lookupFailed'));
    }
  };

  const onPostOfficeChange = (name: string) => {
    setValue('postOfficeName', name);
    const office = lookupData?.postOffices.find((o) => o.name === name);
    if (office) {
      setValue('state', office.state ?? lookupData?.state ?? '');
      if (office.block) {
        setValue('city', office.block);
      } else if (office.district) {
        setValue('city', office.district);
      }
    }
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      label: values.label || undefined,
      fullName: values.fullName,
      phone: values.phone,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 || undefined,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
      country: values.country || 'India',
      postOfficeName: values.postOfficeName || undefined,
      isDefault: values.isDefault,
    });
  });

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.pincodeRow}>
        <label className={styles.field}>
          {t('address.pincode')}
          <input type="text" inputMode="numeric" maxLength={6} {...register('pincode')} />
          {errors.pincode && <span className={styles.error}>{errors.pincode.message}</span>}
        </label>
        <button type="button" className={styles.lookupBtn} onClick={handleLookup} disabled={lookingUp}>
          {lookingUp ? t('address.lookingUp') : t('address.lookup')}
        </button>
      </div>
      {lookupError && <p className={styles.lookupError}>{lookupError}</p>}
      {lookupData && (
        <p className={styles.lookupHint}>
          {t('address.foundOffices', {
            count: lookupData.postOffices.length,
            place: `${lookupData.state}${lookupData.district ? `, ${lookupData.district}` : ''}`,
          })}
        </p>
      )}

      {lookupData && lookupData.postOffices.length > 1 && (
        <label className={styles.field}>
          {t('address.postOfficeField')}
          <select
            value={selectedOffice ?? ''}
            onChange={(e) => onPostOfficeChange(e.target.value)}
          >
            <option value="">{t('address.selectOffice')}</option>
            {lookupData.postOffices.map((office) => (
              <option key={office.name} value={office.name}>
                {office.name} ({office.branchType ?? t('address.office')})
              </option>
            ))}
          </select>
        </label>
      )}

      <label className={styles.field}>
        {t('checkout.fullName')}
        <input type="text" {...register('fullName')} />
        {errors.fullName && <span className={styles.error}>{errors.fullName.message}</span>}
      </label>
      <label className={styles.field}>
        {t('checkout.phone')}
        <input type="tel" {...register('phone')} />
        {errors.phone && <span className={styles.error}>{errors.phone.message}</span>}
      </label>
      <label className={styles.field}>
        {t('address.labelOptional')}
        <input type="text" placeholder={t('address.labelPlaceholder')} {...register('label')} />
      </label>
      <label className={styles.field}>
        {t('checkout.address1')}
        <input type="text" {...register('addressLine1')} />
        {errors.addressLine1 && <span className={styles.error}>{errors.addressLine1.message}</span>}
      </label>
      <label className={styles.field}>
        {t('address.address2')}
        <input type="text" {...register('addressLine2')} />
      </label>
      <div className={styles.row}>
        <label className={styles.field}>
          {t('checkout.city')}
          <input type="text" {...register('city')} />
          {errors.city && <span className={styles.error}>{errors.city.message}</span>}
        </label>
        <label className={styles.field}>
          {t('checkout.state')}
          <input type="text" {...register('state')} />
          {errors.state && <span className={styles.error}>{errors.state.message}</span>}
        </label>
      </div>
      <label className={styles.check}>
        <input type="checkbox" {...register('isDefault')} />
        {t('address.setDefaultCheck')}
      </label>
      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          {t('common.cancel')}
        </button>
        <button type="submit" className={styles.saveBtn} disabled={submitting}>
          {submitting ? t('profile.saving') : t('address.save')}
        </button>
      </div>
    </form>
  );
}
