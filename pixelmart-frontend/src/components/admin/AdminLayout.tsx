import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
import type { RootState } from '../../store';
import { useLogoutMutation } from '../../store/api/authApi';
import { clearCredentials, selectAuthUser } from '../../store/slices/authSlice';

const drawerWidth = 240;

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

export function AdminLayout() {
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
    navigate('/admin-login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'primary.main',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, flexGrow: 1 }}>
            PixelMart Admin
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, opacity: 0.9 }}>
              {user.name}
            </Typography>
          )}
          <Button
            color="inherit"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: 'none' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
      >
        <Toolbar />
        <Box component="nav" sx={{ px: 1, py: 1 }}>
          <Typography
            variant="overline"
            sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', letterSpacing: 1 }}
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
                  borderRadius: 1,
                  mb: 0.5,
                  '&.active': {
                    bgcolor: 'action.selected',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minWidth: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
