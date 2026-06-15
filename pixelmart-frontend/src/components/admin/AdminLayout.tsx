import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';
import type { RootState } from '../../store';
import { useLogoutMutation } from '../../store/api/authApi';
import { clearCredentials, selectAuthUser } from '../../store/slices/authSlice';
import { adminTheme } from '../../theme/adminTheme';
import { clearAdminStorefrontPreview, enableAdminStorefrontPreview } from '../../lib/adminStorefrontPreview';

const drawerWidth = 260;

const SIDEBAR_BG = '#0f172a';
const SIDEBAR_BORDER = 'rgba(148, 163, 184, 0.16)';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, end: true },
  { to: '/admin/products', label: 'Products', icon: <InventoryIcon fontSize="small" /> },
  { to: '/admin/categories', label: 'Categories', icon: <CategoryIcon fontSize="small" /> },
  { to: '/admin/offers', label: 'Offers', icon: <LocalOfferIcon fontSize="small" /> },
  { to: '/admin/orders', label: 'Orders', icon: <ShoppingCartIcon fontSize="small" /> },
  { to: '/admin/reviews', label: 'Reviews', icon: <RateReviewIcon fontSize="small" /> },
  { to: '/admin/audit-log', label: 'Audit log', icon: <HistoryIcon fontSize="small" /> },
  { to: '/admin/settings', label: 'Settings', icon: <SettingsIcon fontSize="small" /> },
];

function AdminLayoutShell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => selectAuthUser(s));
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Clear local session even if API fails
    }
    dispatch(clearCredentials());
    clearAdminStorefrontPreview();
    navigate('/admin-login', { replace: true });
  };

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${SIDEBAR_BORDER}`,
            bgcolor: SIDEBAR_BG,
            color: '#e2e8f0',
          },
        }}
      >
        <Toolbar sx={{ px: 2.5, minHeight: 72 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.main',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.125rem',
              }}
            >
              M
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.1, color: '#f8fafc' }}>
                PixelMart
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Admin console
              </Typography>
            </Box>
          </Box>
        </Toolbar>

        <Divider sx={{ borderColor: SIDEBAR_BORDER }} />

        <Box component="nav" sx={{ px: 1.5, py: 2, flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ px: 1.5, mb: 1, display: 'block', color: '#64748b' }}
          >
            Management
          </Typography>
          <List component="nav" disablePadding>
            {navItems.map((item) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.end}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: '#cbd5e1',
                  '&:hover': {
                    bgcolor: 'rgba(148, 163, 184, 0.12)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#94a3b8',
                    minWidth: 38,
                  },
                  '&.active': {
                    bgcolor: 'rgba(14, 116, 144, 0.22)',
                    color: '#f8fafc',
                    borderLeft: '3px solid',
                    borderColor: 'primary.light',
                    pl: '13px',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontSize: '0.9375rem', fontWeight: 600 } } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {user && (
          <Box sx={{ px: 2, py: 2, borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.dark',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }} noWrap>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }} noWrap>
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={<LogoutIcon fontSize="small" />}
              onClick={handleLogout}
              sx={{
                color: '#e2e8f0',
                borderColor: SIDEBAR_BORDER,
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: 'rgba(148, 163, 184, 0.1)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            px: { xs: 2, md: 3 },
            py: 1.5,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Store management
            </Typography>
            <Button
              size="small"
              variant="text"
              startIcon={<StorefrontIcon fontSize="small" />}
              onClick={() => {
                enableAdminStorefrontPreview();
                navigate('/');
              }}
              sx={{ color: 'text.secondary' }}
            >
              View storefront
            </Button>
          </Box>
        </Box>

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export function AdminLayout() {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <AdminLayoutShell />
    </ThemeProvider>
  );
}
