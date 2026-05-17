import { useAuthHealthQuery, useCatalogHealthQuery } from '../store/api/healthApi';
import styles from './HomePage.module.css';

export function HomePage() {
  const { data: authHealth, isLoading: authLoading } = useAuthHealthQuery();
  const { data: catalogHealth, isLoading: catalogLoading } = useCatalogHealthQuery();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Production-grade e-commerce</p>
        <h1>Welcome to PixelMart</h1>
        <p className={styles.lead}>
          Spring Boot microservices + React + MySQL. Week 1 Day 1: infrastructure shell is live.
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>API Gateway</h2>
          <p>Routes <code>/api/*</code> to auth, catalog, order, and notification services.</p>
        </article>
        <article className={styles.card}>
          <h2>Auth service</h2>
          {authLoading ? <p>Checking…</p> : <p className={styles.status}>{authHealth?.status ?? '—'}</p>}
        </article>
        <article className={styles.card}>
          <h2>Catalog service</h2>
          {catalogLoading ? (
            <p>Checking…</p>
          ) : (
            <p className={styles.status}>{catalogHealth?.status ?? '—'}</p>
          )}
        </article>
        <article className={styles.card}>
          <h2>Theme presets</h2>
          <p>Pixel, Ocean, Sunset, Forest, Mono — light &amp; dark with local persistence.</p>
        </article>
      </section>
    </div>
  );
}
