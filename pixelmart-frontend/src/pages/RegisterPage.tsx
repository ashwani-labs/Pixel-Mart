import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import type { ApiErrorBody } from '../types/auth';
import { useRegisterMutation } from '../store/api/authApi';
import styles from './AuthForm.module.css';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
};

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const registerSchema = z
    .object({
      name: z.string().min(2, t('auth.nameMin')),
      email: z.string().email(t('auth.validEmail')),
      password: z.string().min(8, t('auth.passwordMin')),
      confirmPassword: z.string(),
      referralCode: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordMatch'),
      path: ['confirmPassword'],
    });
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', referralCode: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        referralCode: data.referralCode?.trim() || undefined,
      }).unwrap();
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const apiErr = err as { data?: ApiErrorBody };
      setServerError(apiErr.data?.message ?? t('auth.registerFailed'));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('auth.createAccount')}</h1>
        <p className={styles.subtitle}>{t('auth.joinAs')}</p>

        {serverError && <div className={styles.bannerError} role="alert">{serverError}</div>}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label htmlFor="name">{t('auth.fullName')}</label>
            <input id="name" type="text" autoComplete="name" {...register('name')} />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="email">{t('auth.email')}</label>
            <input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="password">{t('auth.password')}</label>
            <input id="password" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className={styles.error}>{errors.confirmPassword.message}</span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="referralCode">{t('auth.referralOptional')}</label>
            <input id="referralCode" type="text" autoComplete="off" {...register('referralCode')} />
          </div>
          <button type="submit" className={styles.submit} disabled={isLoading}>
            {isLoading ? t('auth.creating') : t('auth.createAccount')}
          </button>
        </form>

        <p className={styles.footer}>
          {t('auth.alreadyHave')} <Link to="/login">{t('auth.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
