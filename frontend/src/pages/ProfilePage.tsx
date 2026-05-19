import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { RequireAuth } from '../components/auth/RequireAuth';
import type { ApiErrorBody } from '../types/auth';
import type { RootState } from '../store';
import { useMeQuery, useUpdateProfileMutation } from '../store/api/authApi';
import { updateUser } from '../store/slices/authSlice';
import styles from './AuthForm.module.css';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type ProfileForm = z.infer<typeof profileSchema>;

function ProfileForm() {
  const dispatch = useDispatch();
  const storedUser = useSelector((s: RootState) => s.auth.user);
  const { data: me, isLoading } = useMeQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const user = me ?? storedUser;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  useEffect(() => {
    if (user?.name) {
      reset({ name: user.name });
    }
  }, [user?.name, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setServerError(null);
    setSaved(false);
    try {
      const updated = await updateProfile(data).unwrap();
      dispatch(updateUser(updated));
      setSaved(true);
    } catch (err) {
      const apiErr = err as { data?: ApiErrorBody };
      setServerError(apiErr.data?.message ?? 'Could not update profile.');
    }
  };

  if (isLoading && !user) {
    return <p>Loading profile…</p>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Your profile</h1>
        <p className={styles.subtitle}>{user?.email}</p>
        <p className={styles.subtitle}>Roles: {user?.roles.join(', ')}</p>

        {saved && <div className={styles.bannerSuccess}>Profile updated.</div>}
        {serverError && <div className={styles.bannerError}>{serverError}</div>}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label htmlFor="name">Display name</label>
            <input id="name" type="text" autoComplete="name" {...register('name')} />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>
          <button type="submit" className={styles.submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <p className={styles.footer}>
          <Link to="/">← Back home</Link>
        </p>
      </div>
    </div>
  );
}

export function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileForm />
    </RequireAuth>
  );
}
