import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button, MenuItem, TextField } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import type { RootState } from '../store';
import {
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
} from '../store/api/orderApi';
import type { Order } from '../types/order';
import formStyles from './AdminProductsPage.module.css';

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

function exportOrdersCsv(orders: Order[], locale: string, currency: string) {
  const header = ['Order', 'Customer', 'Status', 'Total', 'Tracking', 'Created'];
  const rows = orders.map((order) => [
    order.orderNumber,
    order.shipToName,
    order.status,
    formatPrice(order.grandTotal, locale, currency),
    order.trackingNumber ?? '',
    new Date(order.createdAt).toISOString(),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pixelmart-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AdminOrdersPage() {
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const { data: orders = [], isLoading } = useGetAdminOrdersQuery();
  const [updateStatus] = useUpdateAdminOrderStatusMutation();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleStatusChange = useCallback(async (orderId: string, status: string) => {
    setMessage(null);
    try {
      await updateStatus({ id: orderId, status }).unwrap();
      setMessage('Order status updated.');
    } catch {
      setMessage('Could not update order status.');
    }
  }, [updateStatus]);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const haystack = `${order.orderNumber} ${order.shipToName} ${order.trackingNumber ?? ''}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const columns = useMemo<GridColDef<Order>[]>(
    () => [
      { field: 'orderNumber', headerName: 'Order', flex: 1, minWidth: 150 },
      { field: 'shipToName', headerName: 'Customer', flex: 1, minWidth: 140 },
      { field: 'status', headerName: 'Status', width: 120 },
      {
        field: 'trackingNumber',
        headerName: 'Tracking',
        flex: 1,
        minWidth: 140,
        valueGetter: (_value, row) => row.trackingNumber ?? '—',
      },
      {
        field: 'grandTotal',
        headerName: 'Total',
        width: 120,
        valueFormatter: (value) => formatPrice(Number(value), marketLocale, marketCurrencyCode),
      },
      {
        field: 'createdAt',
        headerName: 'Placed',
        width: 170,
        valueFormatter: (value) => new Date(String(value)).toLocaleString(marketLocale),
      },
      {
        field: 'actions',
        headerName: 'Update status',
        width: 170,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <TextField
            select
            size="small"
            value={row.status}
            onChange={(event) => void handleStatusChange(row.id, event.target.value)}
            sx={{ minWidth: 130 }}
          >
            {STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        ),
      },
    ],
    [marketCurrencyCode, marketLocale, handleStatusChange],
  );

  return (
    <Box>
      <AdminPageHeader
        title="Orders"
        subtitle="Filter, export, and update fulfillment status for all customer orders."
      />
      {message && <p className={formStyles.message}>{message}</p>}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" onClick={() => exportOrdersCsv(filtered, marketLocale, marketCurrencyCode)}>
          Export CSV
        </Button>
      </Box>

      <DataGrid
        rows={filtered}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.id}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
      />
    </Box>
  );
}
