import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import type { ApiErrorBody } from '../types/auth';
import { useAdminLoginMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import formStyles from './AuthForm.module.css';
import styles from './AdminLoginPage.module.css';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [adminLogin, { isLoading }] = useAdminLoginMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const state = location.state as { from?: string } | null;
  const from = state?.from ?? '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      const result = await adminLogin(data).unwrap();
      dispatch(setCredentials({ accessToken: result.accessToken, user: result.user }));
      navigate(from, { replace: true });
    } catch (err) {
      const apiErr = err as { data?: ApiErrorBody };
      setServerError(apiErr.data?.message ?? 'Invalid credentials.');
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.brand}>
        <p className={styles.brandTitle}>PixelMart Admin</p>
        <p className={styles.brandSub}>Store management portal</p>
      </div>

      <div className={styles.panel}>
        <div className={formStyles.card}>
          <h1 className={formStyles.title}>Admin sign in</h1>
          <p className={formStyles.subtitle}>Sign in with your administrator account</p>

          {serverError && (
            <div className={formStyles.bannerError} role="alert">
              {serverError}
            </div>
          )}

          <form className={formStyles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={formStyles.field}>
              <label htmlFor="admin-email">Admin email</label>
              <input id="admin-email" type="email" autoComplete="username" {...register('email')} />
              {errors.email && <span className={formStyles.error}>{errors.email.message}</span>}
            </div>
            <div className={formStyles.field}>
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && <span className={formStyles.error}>{errors.password.message}</span>}
            </div>
            <button type="submit" className={formStyles.submit} disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in to admin'}
            </button>
          </form>

          <p className={formStyles.footer}>
            Shopping as a customer? <Link to="/login">Customer sign in</Link>
          </p>

          <div className={formStyles.hint}>
            <strong>Demo admin:</strong> admin@pixelmart.local / Admin@123
          </div>
        </div>

        <p className={styles.back}>
          <Link to="/">← Back to store</Link>
        </p>
      </div>
    </div>
  );
}
