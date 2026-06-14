import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Address, PincodeLookup, UpsertAddressRequest } from '../../types/address';
import { useLazyLookupPincodeQuery } from '../../store/api/orderApi';
import styles from './AddressForm.module.css';

const addressSchema = z.object({
  label: z.string().max(64).optional(),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(8, 'Phone is required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Enter a 6-digit PIN'),
  postOfficeName: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().optional(),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface Props {
  initial?: Address;
  onSubmit: (data: UpsertAddressRequest) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export function AddressForm({ initial, onSubmit, onCancel, submitting }: Props) {
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
      setLookupError('Enter a valid 6-digit PIN first');
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
      setLookupError('PIN not found or lookup failed');
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
          PIN code
          <input type="text" inputMode="numeric" maxLength={6} {...register('pincode')} />
          {errors.pincode && <span className={styles.error}>{errors.pincode.message}</span>}
        </label>
        <button type="button" className={styles.lookupBtn} onClick={handleLookup} disabled={lookingUp}>
          {lookingUp ? 'Looking up…' : 'Lookup'}
        </button>
      </div>
      {lookupError && <p className={styles.lookupError}>{lookupError}</p>}
      {lookupData && (
        <p className={styles.lookupHint}>
          Found {lookupData.postOffices.length} post office(s) — {lookupData.state}
          {lookupData.district ? `, ${lookupData.district}` : ''}
        </p>
      )}

      {lookupData && lookupData.postOffices.length > 1 && (
        <label className={styles.field}>
          Post office
          <select
            value={selectedOffice ?? ''}
            onChange={(e) => onPostOfficeChange(e.target.value)}
          >
            <option value="">Select post office</option>
            {lookupData.postOffices.map((office) => (
              <option key={office.name} value={office.name}>
                {office.name} ({office.branchType ?? 'Office'})
              </option>
            ))}
          </select>
        </label>
      )}

      <label className={styles.field}>
        Full name
        <input type="text" {...register('fullName')} />
        {errors.fullName && <span className={styles.error}>{errors.fullName.message}</span>}
      </label>
      <label className={styles.field}>
        Phone
        <input type="tel" {...register('phone')} />
        {errors.phone && <span className={styles.error}>{errors.phone.message}</span>}
      </label>
      <label className={styles.field}>
        Label (optional)
        <input type="text" placeholder="Home, Office…" {...register('label')} />
      </label>
      <label className={styles.field}>
        Address line 1
        <input type="text" {...register('addressLine1')} />
        {errors.addressLine1 && <span className={styles.error}>{errors.addressLine1.message}</span>}
      </label>
      <label className={styles.field}>
        Address line 2 (optional)
        <input type="text" {...register('addressLine2')} />
      </label>
      <div className={styles.row}>
        <label className={styles.field}>
          City
          <input type="text" {...register('city')} />
          {errors.city && <span className={styles.error}>{errors.city.message}</span>}
        </label>
        <label className={styles.field}>
          State
          <input type="text" {...register('state')} />
          {errors.state && <span className={styles.error}>{errors.state.message}</span>}
        </label>
      </div>
      <label className={styles.check}>
        <input type="checkbox" {...register('isDefault')} />
        Set as default address
      </label>
      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.saveBtn} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save address'}
        </button>
      </div>
    </form>
  );
}
