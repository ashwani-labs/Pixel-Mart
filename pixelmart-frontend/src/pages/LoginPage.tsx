import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import type { ApiErrorBody } from '../types/auth';
import { useLoginMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import styles from './AuthForm.module.css';

type LoginForm = {
  email: string;
  password: string;
};

export function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const loginSchema = z.object({
    email: z.string().email(t('auth.validEmail')),
    password: z.string().min(1, t('auth.passwordRequired')),
  });
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
      setServerError(apiErr.data?.message ?? t('auth.invalidCredentials'));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('auth.signIn')}</h1>
        <p className={styles.subtitle}>{t('auth.welcomeBack')}</p>

        {registered && (
          <div className={styles.bannerSuccess}>{t('auth.accountCreated')}</div>
        )}
        {serverError && <div className={styles.bannerError} role="alert">{serverError}</div>}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label htmlFor="email">{t('auth.email')}</label>
            <input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="password">{t('auth.password')}</label>
            <input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>
          <button type="submit" className={styles.submit} disabled={isLoading}>
            {isLoading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <p className={styles.footer}>
          {t('auth.newHere')} <Link to="/register">{t('auth.createAccount')}</Link>
        </p>

        <div className={styles.hint}>
          <strong>{t('auth.demoCustomer')}</strong> customer@pixelmart.local / Customer@123
        </div>
      </div>
    </div>
  );
}
