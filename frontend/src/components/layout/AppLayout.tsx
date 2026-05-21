import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { useLogoutMutation } from '../../store/api/authApi';
import { clearCredentials, selectAuthUser, selectHasRole, selectIsAuthenticated } from '../../store/slices/authSlice';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const user = useSelector((s: RootState) => selectAuthUser(s));
  const isAdmin = useSelector((s: RootState) => selectHasRole('ADMIN')(s));
  const storeName = useSelector((s: RootState) => s.settings.storeName);
  const logoUrl = useSelector((s: RootState) => s.settings.logoUrl);
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Clear local session even if API fails
    }
    dispatch(clearCredentials());
    navigate('/');
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          {logoUrl ? (
            <img src={logoUrl} alt="" className={styles.logoImg} />
          ) : (
            <span className={styles.logoMark}>◆</span>
          )}
          {storeName}
        </Link>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Products
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? styles.active : undefined)}>
                Profile
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => (isActive ? styles.active : undefined)}>
                  Admin
                </NavLink>
              )}
            </>
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
        </nav>
        <div className={styles.headerActions}>
          {isAuthenticated && (
            <>
              <span className={styles.userGreeting}>Hi, {user?.name?.split(' ')[0]}</span>
              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
          <ThemeSwitcher />
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>{storeName} — Week 1</p>
      </footer>
    </div>
  );
}
