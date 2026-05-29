import { NavLink, Outlet } from 'react-router-dom';
import {
  Box,
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
  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
      >
        <Toolbar>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Admin console
          </Typography>
        </Toolbar>
        <List component="nav" sx={{ px: 1 }}>
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
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
