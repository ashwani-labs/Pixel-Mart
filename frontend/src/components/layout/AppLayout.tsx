import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { clearCredentials, selectAuthUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const user = useSelector((s: RootState) => selectAuthUser(s));

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate('/');
  };

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
          {isAuthenticated ? (
            <span className={styles.userGreeting}>Hi, {user?.name?.split(' ')[0]}</span>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? styles.active : undefined)}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? styles.active : undefined)}>
                Register
              </NavLink>
            </>
          )}
          <NavLink to="/admin" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Admin
          </NavLink>
        </nav>
        <div className={styles.headerActions}>
          {isAuthenticated && (
            <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          )}
          <ThemeSwitcher />
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>PixelMart — Week 1 Day 2</p>
      </footer>
    </div>
  );
}
