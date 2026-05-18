import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import type { ApiErrorBody } from '../types/auth';
import { useLoginMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import styles from './AuthForm.module.css';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const state = location.state as { from?: string; registered?: boolean } | null;
  const from = state?.from ?? '/';
  const registered = state?.registered;

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
      const result = await login(data).unwrap();
      dispatch(setCredentials({ accessToken: result.accessToken, user: result.user }));
      navigate(from, { replace: true });
    } catch (err) {
      const apiErr = err as { data?: ApiErrorBody };
      setServerError(apiErr.data?.message ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Welcome back to PixelMart</p>

        {registered && (
          <div className={styles.bannerSuccess}>Account created. Please sign in.</div>
        )}
        {serverError && <div className={styles.bannerError}>{serverError}</div>}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>
          <button type="submit" className={styles.submit} disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.footer}>
          New here? <Link to="/register">Create an account</Link>
        </p>

        <div className={styles.hint}>
          <strong>Demo:</strong> admin@pixelmart.local / Admin@123
        </div>
      </div>
    </div>
  );
}
