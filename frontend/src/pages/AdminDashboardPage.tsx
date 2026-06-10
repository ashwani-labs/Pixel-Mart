import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, Link, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Store overview for today, 7-day trends, and inventory alerts.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Orders today
            </Typography>
            <Typography variant="h3">
              {ordersLoading ? '…' : (orderStats?.ordersToday ?? 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Revenue:{' '}
              {ordersLoading
                ? '…'
                : formatPrice(Number(orderStats?.revenueToday ?? 0), marketLocale, marketCurrencyCode)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Low stock products
            </Typography>
            <Typography variant="h3">
              {catalogLoading ? '…' : (catalogStats?.lowStockCount ?? 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Threshold: {catalogStats?.lowStockThreshold ?? 5} units or less
            </Typography>
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
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Orders (last 7 days)
            </Typography>
            {ordersLoading ? (
              <Typography color="text.secondary">Loading chart…</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#6366f1" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Revenue (last 7 days)
            </Typography>
            {ordersLoading ? (
              <Typography color="text.secondary">Loading chart…</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      formatPrice(Number(value ?? 0), marketLocale, marketCurrencyCode)
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                    strokeWidth={2}
                    name="Revenue"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Low stock watchlist
          </Typography>
          {catalogLoading ? (
            <Typography color="text.secondary">Loading…</Typography>
          ) : catalogStats && catalogStats.lowStockProducts.length > 0 ? (
            catalogStats.lowStockProducts.map((product) => (
              <Box
                key={product.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Link component={RouterLink} to={`/products/${product.slug}`} underline="hover">
                  {product.name}
                </Link>
                <Typography color="text.secondary">{product.stockQty} left</Typography>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">All products are above the low stock threshold.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
