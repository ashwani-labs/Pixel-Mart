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
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
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

function formatPaymentMethod(method: string) {
  return method.replace(/^MOCK_/, '').replace(/_/g, ' ');
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
    orderStats?.trends?.map((point) => ({
      date: formatTrendDate(point.date),
      orders: point.orderCount,
      revenue: Number(point.revenue),
    })) ?? [];

  const weekOrders = chartData.reduce((sum, point) => sum + point.orders, 0);
  const weekRevenue = chartData.reduce((sum, point) => sum + point.revenue, 0);

  const paymentChartData =
    orderStats?.paymentMethodBreakdown?.map((row) => ({
      method: formatPaymentMethod(row.method),
      orders: row.orderCount,
      revenue: Number(row.revenue),
    })) ?? [];

  const topCoupons = orderStats?.topCoupons ?? [];

  const topSearchTerms = catalogStats?.topSearchTerms ?? [];
  const funnel = catalogStats?.funnelStats ?? {
    productViews: 0,
    cartAdds: 0,
    checkoutStarts: 0,
    orders: 0,
  };

  const funnelChartData = [
    { step: 'Product views', count: funnel.productViews },
    { step: 'Cart adds', count: funnel.cartAdds },
    { step: 'Checkout', count: funnel.checkoutStarts },
    { step: 'Orders', count: funnel.orders },
  ];

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
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
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
          label="Low stock"
          value={catalogLoading ? '…' : (catalogStats?.lowStockCount ?? 0)}
          hint={`Threshold: ${catalogStats?.lowStockThreshold ?? 5} units or less`}
          icon={<Inventory2OutlinedIcon />}
          accent="#d97706"
          loading={catalogLoading}
        />
        <AdminStatCard
          label="Pending reviews"
          value={catalogLoading ? '…' : (catalogStats?.pendingReviewCount ?? 0)}
          hint="Awaiting moderation"
          icon={<RateReviewOutlinedIcon />}
          accent="#7c3aed"
          loading={catalogLoading}
        />
        <AdminStatCard
          label="Coupon orders (7d)"
          value={ordersLoading ? '…' : (orderStats?.couponOrdersLast7Days ?? 0)}
          hint="Orders with a coupon code"
          icon={<LocalOfferOutlinedIcon />}
          accent="#db2777"
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
            <Typography variant="h6" sx={{ mb: 2 }}>
              Payment methods (7 days)
            </Typography>
            {ordersLoading ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : paymentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={paymentChartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="method" tick={{ fill: CHART_COLORS.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: CHART_COLORS.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value, name) =>
                      name === 'revenue'
                        ? formatPrice(Number(value ?? 0), marketLocale, marketCurrencyCode)
                        : value
                    }
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Bar dataKey="orders" fill={CHART_COLORS.orders} name="Orders" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary">No orders in the last 7 days.</Typography>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top coupons (7 days)
            </Typography>
            {ordersLoading ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : topCoupons.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {topCoupons.map((coupon) => (
                  <Box
                    key={coupon.couponCode}
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
                    <Typography sx={{ fontWeight: 700 }}>{coupon.couponCode}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Chip label={`${coupon.redemptions} uses`} size="small" variant="outlined" />
                      <Chip
                        label={formatPrice(Number(coupon.discountTotal), marketLocale, marketCurrencyCode)}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No coupon redemptions in the last 7 days.</Typography>
            )}
          </CardContent>
        </Card>
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
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top search terms (7 days)
            </Typography>
            {catalogLoading ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : topSearchTerms.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {topSearchTerms.map((row) => (
                  <Box
                    key={row.term}
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
                    <Typography sx={{ fontWeight: 600 }}>{row.term}</Typography>
                    <Chip label={`${row.count} searches`} size="small" variant="outlined" />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No search data yet.</Typography>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Conversion funnel (7 days)
            </Typography>
            {catalogLoading ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={funnelChartData} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: CHART_COLORS.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="step" width={100} tick={{ fill: CHART_COLORS.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Bar dataKey="count" fill={CHART_COLORS.orders} name="Count" radius={[0, 8, 8, 0]} maxBarSize={32} />
                </BarChart>
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
          ) : (catalogStats?.lowStockProducts?.length ?? 0) > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(catalogStats?.lowStockProducts ?? []).map((product) => (
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
