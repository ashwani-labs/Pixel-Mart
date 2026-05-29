import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, Link, Typography } from '@mui/material';
import { useGetCatalogDashboardStatsQuery } from '../store/api/catalogApi';
import { useGetOrderDashboardStatsQuery } from '../store/api/orderApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function AdminDashboardPage() {
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const { data: orderStats, isLoading: ordersLoading } = useGetOrderDashboardStatsQuery();
  const { data: catalogStats, isLoading: catalogLoading } = useGetCatalogDashboardStatsQuery();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Store overview for today and inventory alerts.
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
