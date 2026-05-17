import { Outlet, Link, NavLink } from 'react-router-dom';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>◆</span>
          PixelMart
        </Link>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Home
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Login
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Admin
          </NavLink>
        </nav>
        <ThemeSwitcher />
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>PixelMart — Week 1 Day 1 scaffold</p>
      </footer>
    </div>
  );
}
