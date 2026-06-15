import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Link,
  Typography,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { AdminStatCard } from '../components/admin/AdminStatCard';
import { useGetCatalogDashboardStatsQuery } from '../store/api/catalogApi';
import { useGetOrderDashboardStatsQuery } from '../store/api/orderApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

function formatTrendDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const CHART_COLORS = {
  orders: '#6366f1',
  revenue: '#059669',
  grid: '#e2e8f0',
  axis: '#94a3b8',
};

export function AdminDashboardPage() {
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const { data: orderStats, isLoading: ordersLoading } = useGetOrderDashboardStatsQuery();
  const { data: catalogStats, isLoading: catalogLoading } = useGetCatalogDashboardStatsQuery();

  const chartData =
    orderStats?.trends.map((point) => ({
      date: formatTrendDate(point.date),
      orders: point.orderCount,
      revenue: Number(point.revenue),
    })) ?? [];

  const weekOrders = chartData.reduce((sum, point) => sum + point.orders, 0);
  const weekRevenue = chartData.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <Box>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Store overview for today, 7-day trends, and inventory alerts."
        actions={
          <>
            <Button component={RouterLink} to="/admin/orders" variant="outlined" size="small">
              View orders
            </Button>
            <Button component={RouterLink} to="/admin/products" variant="contained" size="small">
              Manage products
            </Button>
          </>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <AdminStatCard
          label="Orders today"
          value={ordersLoading ? '…' : (orderStats?.ordersToday ?? 0)}
          hint={
            ordersLoading
              ? undefined
              : `Revenue ${formatPrice(Number(orderStats?.revenueToday ?? 0), marketLocale, marketCurrencyCode)}`
          }
          icon={<ShoppingCartOutlinedIcon />}
          accent="#6366f1"
          loading={ordersLoading}
        />
        <AdminStatCard
          label="Revenue today"
          value={
            ordersLoading
              ? '…'
              : formatPrice(Number(orderStats?.revenueToday ?? 0), marketLocale, marketCurrencyCode)
          }
          hint="Gross sales for the current day"
          icon={<PaymentsOutlinedIcon />}
          accent="#059669"
          loading={ordersLoading}
        />
        <AdminStatCard
          label="7-day orders"
          value={ordersLoading ? '…' : weekOrders}
          hint="Total orders in the last week"
          icon={<TrendingUpOutlinedIcon />}
          accent="#0e7490"
          loading={ordersLoading}
        />
        <AdminStatCard
          label="Low stock"
          value={catalogLoading ? '…' : (catalogStats?.lowStockCount ?? 0)}
          hint={`Threshold: ${catalogStats?.lowStockThreshold ?? 5} units or less`}
          icon={<Inventory2OutlinedIcon />}
          accent="#d97706"
          loading={catalogLoading}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Orders (last 7 days)</Typography>
              <Chip label={`${weekOrders} total`} size="small" color="secondary" variant="outlined" />
            </Box>
            {ordersLoading ? (
              <Typography color="text.secondary">Loading chart…</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: CHART_COLORS.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: CHART_COLORS.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Bar
                    dataKey="orders"
                    fill={CHART_COLORS.orders}
                    name="Orders"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Revenue (last 7 days)</Typography>
              <Chip
                label={formatPrice(weekRevenue, marketLocale, marketCurrencyCode)}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
            {ordersLoading ? (
              <Typography color="text.secondary">Loading chart…</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: CHART_COLORS.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: CHART_COLORS.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) =>
                      formatPrice(Number(value ?? 0), marketLocale, marketCurrencyCode)
                    }
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_COLORS.revenue}
                    strokeWidth={3}
                    name="Revenue"
                    dot={{ r: 4, fill: CHART_COLORS.revenue, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Low stock watchlist</Typography>
            <Button component={RouterLink} to="/admin/products" size="small">
              Manage inventory
            </Button>
          </Box>
          {catalogLoading ? (
            <Typography color="text.secondary">Loading…</Typography>
          ) : catalogStats && catalogStats.lowStockProducts.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {catalogStats.lowStockProducts.map((product) => (
                <Box
                  key={product.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Link component={RouterLink} to="/admin/products" underline="hover" sx={{ fontWeight: 600 }}>
                    {product.name}
                  </Link>
                  <Chip
                    label={`${product.stockQty} left`}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                py: 3,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: 'success.light',
                color: 'success.dark',
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>All products are above the low stock threshold.</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
